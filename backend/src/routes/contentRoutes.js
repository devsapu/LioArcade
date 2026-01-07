import express from 'express';
import * as contentController from '../controllers/contentController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', contentController.getAllContent);
router.get('/categories', contentController.getCategories);
router.get('/:id', contentController.getContentById);

// Protected routes (Admin/Content Manager only)
router.post('/', authenticateToken, requireRole('ADMIN', 'CONTENT_MANAGER'), contentController.createContent);
router.put('/:id', authenticateToken, requireRole('ADMIN', 'CONTENT_MANAGER'), contentController.updateContent);
router.delete('/:id', authenticateToken, requireRole('ADMIN', 'CONTENT_MANAGER'), contentController.deleteContent);

export default router;

