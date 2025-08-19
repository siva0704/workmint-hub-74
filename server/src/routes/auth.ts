import { Router } from 'express';
import { login, logout, refreshToken, signup } from '../controllers/authController';
import { validateLogin, validateSignup } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { createRateLimit } from '../middleware/security';

const router = Router();

// Rate limiters for security
const signupRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 signup attempts per window
  'Too many signup attempts, please try again later'
);

const loginRateLimit = createRateLimit(
  3 * 60 * 1000, // 3 minutes
  5, // 5 login attempts per window  
  'Too many login attempts, please try again later'
);

// Auth routes with rate limiting
router.post('/login', loginRateLimit, validateLogin, login);
router.post('/signup', signupRateLimit, validateSignup, signup);
router.post('/refresh', refreshToken);
router.post('/logout', authenticateToken, logout);

export default router;