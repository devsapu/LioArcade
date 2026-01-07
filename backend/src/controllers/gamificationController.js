import * as gamificationService from '../services/gamificationService.js';
import { z } from 'zod';

const submitScoreSchema = z.object({
  contentId: z.string().uuid('Invalid content ID'),
  score: z.number().min(0),
  maxScore: z.number().min(1),
});

/**
 * Submit score
 */
export const submitScore = async (req, res, next) => {
  try {
    const validatedData = submitScoreSchema.parse(req.body);
    const result = await gamificationService.submitScore(
      req.user.userId,
      validatedData.contentId,
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
    const { limit = 10, by = 'points' } = req.query;
    const leaderboard = await gamificationService.getLeaderboard({
      limit: parseInt(limit),
      by,
    });
    res.json({ leaderboard });
  } catch (error) {
    next(error);
  }
};

