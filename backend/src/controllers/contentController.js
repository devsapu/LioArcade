import * as contentService from '../services/contentService.js';

/**
 * Get all content
 */
export const getAllContent = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      category,
      difficultyLevel,
      search,
    } = req.query;

    const result = await contentService.getAllContent({
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      category,
      difficultyLevel,
      search,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get content by ID
 */
export const getContentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const content = await contentService.getContentById(id);
    res.json(content);
  } catch (error) {
    if (error.message === 'Content not found') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Create content
 */
export const createContent = async (req, res, next) => {
  try {
    const content = await contentService.createContent(
      req.body,
      req.user.userId
    );
    res.status(201).json({
      message: 'Content created successfully',
      content,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    next(error);
  }
};

/**
 * Update content
 */
export const updateContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const content = await contentService.updateContent(
      id,
      req.body,
      req.user.userId
    );
    res.json({
      message: 'Content updated successfully',
      content,
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
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Delete content
 */
export const deleteContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await contentService.deleteContent(id, req.user.userId);
    res.json(result);
  } catch (error) {
    if (error.message === 'Content not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Get categories
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await contentService.getCategories();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

