import { Router } from 'express';
import { login, logout, refreshToken, signup } from '../controllers/authController';
import { validateLogin, validateSignup } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', validateLogin, login);
router.post('/signup', validateSignup, signup);
router.post('/refresh', refreshToken);
router.post('/logout', authenticateToken, logout);

export default router;