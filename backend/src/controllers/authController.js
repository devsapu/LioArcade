import * as authService from '../services/authService.js';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['LEARNER', 'ADMIN', 'CONTENT_MANAGER']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Register a new user
 */
export const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const user = await authService.registerUser(
      validatedData.email,
      validatedData.password,
      validatedData.role
    );

    res.status(201).json({
      message: 'User registered successfully',
      user,
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
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.loginUser(
      validatedData.email,
      validatedData.password
    );

    res.json({
      message: 'Login successful',
      ...result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({
        error: error.message,
      });
    }
    
    next(error);
  }
};

/**
 * Refresh access token
 */
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token is required',
      });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.json({
      message: 'Token refreshed successfully',
      ...result,
    });
  } catch (error) {
    res.status(401).json({
      error: error.message || 'Invalid refresh token',
    });
  }
};



