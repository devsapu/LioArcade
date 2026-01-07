import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

// Protected routes (to be added later)
// router.post('/reset-password', authController.resetPassword);

export default router;

