import express from 'express';
import * as gamificationController from '../controllers/gamificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/submit-score', authenticateToken, gamificationController.submitScore);
router.get('/progress', authenticateToken, gamificationController.getUserProgress);

// Public leaderboard
router.get('/leaderboard', gamificationController.getLeaderboard);

export default router;



