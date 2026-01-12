import prisma from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Update user profile image
 */
export const updateProfileImage = async (userId, imageUrl) => {
  // Get current user to check for existing image
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { profileImage: true },
  });

  // If user has an existing image, delete it from filesystem
  if (currentUser?.profileImage && imageUrl !== null) {
    const oldImagePath = path.join(__dirname, '../../uploads', path.basename(currentUser.profileImage));
    try {
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    } catch (error) {
      console.error('Error deleting old profile image:', error);
      // Continue even if deletion fails
    }
  }

  // Update user profile image
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      profileImage: imageUrl,
    },
    select: {
      id: true,
      email: true,
      username: true,
      profileImage: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      profileImage: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
};
