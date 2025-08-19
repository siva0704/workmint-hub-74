import { Router, Response, NextFunction } from 'express';
import { 
  updateSuperAdminProfile,
  getSystemStats
} from '../controllers/saUserController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// All routes require authentication and super_admin role
router.use(authenticateToken);
router.use(requireRole(['super_admin']));

// Update SuperAdmin profile
router.patch(
  '/users/:userId/profile',
  (req: AuthRequest, res: Response, next: NextFunction) => {
    // SuperAdmin can only update their own profile
    if (req.user?.id !== req.params.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile',
      });
    }
    next();
  },
  updateSuperAdminProfile
);

// Get system statistics
router.get('/system-stats', getSystemStats);

export default router;
