import * as gamificationService from '../services/gamificationService.js';
import * as contentService from '../services/contentService.js';
import { z } from 'zod';

const submitScoreSchema = z.object({
  contentId: z.string(), // Allow non-UUID for sample quizzes
  score: z.number().min(0),
  maxScore: z.number().min(1),
  // Optional: allow passing sample quiz data to create it
  sampleQuizData: z.object({
    type: z.enum(['QUIZ', 'FLASHCARD', 'MINI_GAME']),
    title: z.string(),
    description: z.string().optional(),
    contentData: z.any(),
    category: z.string().optional(),
    difficultyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  }).optional(),
});

/**
 * Submit score
 */
export const submitScore = async (req, res, next) => {
  try {
    const validatedData = submitScoreSchema.parse(req.body);
    let contentId = validatedData.contentId;

    // Handle sample content (quizzes, flashcards, games) - create them if they don't exist
    if ((contentId.startsWith('sample-') || contentId.startsWith('math-game-')) && validatedData.sampleQuizData) {
      try {
        // Try to find existing content with same title and type
        const existingContent = await contentService.getAllContent({
          search: validatedData.sampleQuizData.title,
          type: validatedData.sampleQuizData.type,
          limit: 1,
        });

        if (existingContent.content && existingContent.content.length > 0) {
          // Use existing content
          contentId = existingContent.content[0].id;
        } else {
          // Create new content for sample items (bypass role check for sample content)
          // We'll create it directly using Prisma to bypass the role middleware
          const prisma = (await import('../config/database.js')).default;
          const newContent = await prisma.content.create({
            data: {
              type: validatedData.sampleQuizData.type,
              title: validatedData.sampleQuizData.title,
              description: validatedData.sampleQuizData.description,
              contentData: validatedData.sampleQuizData.contentData,
              category: validatedData.sampleQuizData.category,
              difficultyLevel: validatedData.sampleQuizData.difficultyLevel,
              createdById: req.user.userId,
            },
          });
          contentId = newContent.id;
        }
      } catch (createError) {
        // If creation fails, try to find by title again or return error
        return res.status(400).json({
          error: 'Failed to create sample content',
          details: createError.message,
        });
      }
    } else if (contentId.startsWith('sample-') || contentId.startsWith('math-game-')) {
      // Sample content ID provided but no data - return error
      return res.status(400).json({
        error: 'Sample content data required',
        message: 'Please provide sampleQuizData when submitting scores for sample content',
      });
    }

    // Validate contentId is now a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(contentId)) {
      return res.status(400).json({
        error: 'Invalid content ID',
        message: 'Content ID must be a valid UUID',
      });
    }

    const result = await gamificationService.submitScore(
      req.user.userId,
      contentId,
      validatedData.score,
      validatedData.maxScore
    );

    res.json({
      message: 'Score submitted successfully',
      ...result,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    if (error.message === 'Content not found') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Get user progress
 */
export const getUserProgress = async (req, res, next) => {
  try {
    const progress = await gamificationService.getUserProgress(req.user.userId);
    res.json(progress);
  } catch (error) {
    if (error.message === 'Gamification record not found') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Get leaderboard
 */
export const getLeaderboard = async (req, res, next) => {
  try {
    const { limit = 10, by = 'points', contentType } = req.query;
    const leaderboard = await gamificationService.getLeaderboard({
      limit: parseInt(limit),
      by,
      contentType: contentType || null, // QUIZ, FLASHCARD, MINI_GAME, or null for overall
    });
    res.json({ leaderboard });
  } catch (error) {
    next(error);
  }
};



