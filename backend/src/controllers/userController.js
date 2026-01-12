import * as userService from '../services/userService.js';
import { z } from 'zod';

// Validation schema for profile image update
const updateProfileImageSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

/**
 * Upload profile image
 */
export const uploadProfileImage = async (req, res, next) => {
  try {
    const userId = req.user.userId; // From auth middleware
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: 'No image file provided',
      });
    }

    const profileImageUrl = `/uploads/${file.filename}`;
    const updatedUser = await userService.updateProfileImage(userId, profileImageUrl);

    res.json({
      message: 'Profile image uploaded successfully',
      user: updatedUser,
      imageUrl: profileImageUrl,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    next(error);
  }
};

/**
 * Get user profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await userService.getUserProfile(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json({
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete profile image
 */
export const deleteProfileImage = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updatedUser = await userService.updateProfileImage(userId, null);

    res.json({
      message: 'Profile image deleted successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
