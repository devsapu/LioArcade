import express from 'express';
import { uploadProfileImage, getProfile, deleteProfileImage } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../config/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user profile
router.get('/profile', getProfile);

// Upload profile image
router.post('/profile/image', upload.single('image'), uploadProfileImage);

// Delete profile image
router.delete('/profile/image', deleteProfileImage);

export default router;
