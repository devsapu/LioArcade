import prisma from '../config/database.js';
import { z } from 'zod';

// Validation schemas
const createContentSchema = z.object({
  type: z.enum(['QUIZ', 'FLASHCARD', 'MINI_GAME']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  contentData: z.any(), // JSON structure varies by content type
  category: z.string().optional(),
  difficultyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
});

const updateContentSchema = createContentSchema.partial();

/**
 * Get all content with pagination and filters
 */
export const getAllContent = async (options = {}) => {
  const {
    page = 1,
    limit = 20,
    type,
    category,
    difficultyLevel,
    search,
  } = options;

  const skip = (page - 1) * limit;

  const where = {};
  if (type) where.type = type;
  if (category) where.category = category;
  if (difficultyLevel) where.difficultyLevel = difficultyLevel;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [content, total] = await Promise.all([
    prisma.content.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    }),
    prisma.content.count({ where }),
  ]);

  return {
    content,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get content by ID
 */
export const getContentById = async (id) => {
  const content = await prisma.content.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!content) {
    throw new Error('Content not found');
  }

  return content;
};

/**
 * Create new content
 */
export const createContent = async (data, userId) => {
  const validatedData = createContentSchema.parse(data);

  const content = await prisma.content.create({
    data: {
      ...validatedData,
      createdById: userId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  return content;
};

/**
 * Update content
 */
export const updateContent = async (id, data, userId) => {
  // Check if content exists
  const existingContent = await prisma.content.findUnique({
    where: { id },
  });

  if (!existingContent) {
    throw new Error('Content not found');
  }

  // Check if user is the creator or admin
  if (existingContent.createdById !== userId) {
    // In a real app, you'd check if user is admin here
    throw new Error('Unauthorized to update this content');
  }

  const validatedData = updateContentSchema.parse(data);

  const content = await prisma.content.update({
    where: { id },
    data: validatedData,
    include: {
      createdBy: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  return content;
};

/**
 * Delete content
 */
export const deleteContent = async (id, userId) => {
  const existingContent = await prisma.content.findUnique({
    where: { id },
  });

  if (!existingContent) {
    throw new Error('Content not found');
  }

  // Check if user is the creator or admin
  if (existingContent.createdById !== userId) {
    throw new Error('Unauthorized to delete this content');
  }

  await prisma.content.delete({
    where: { id },
  });

  return { message: 'Content deleted successfully' };
};

/**
 * Get content categories
 */
export const getCategories = async () => {
  const categories = await prisma.content.findMany({
    select: {
      category: true,
    },
    distinct: ['category'],
    where: {
      category: {
        not: null,
      },
    },
  });

  return categories.map((c) => c.category).filter(Boolean);
};

