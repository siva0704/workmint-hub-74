import { Router } from 'express';
import { 
  getUsers, 
  getUser,
  createUser, 
  updateUser, 
  deleteUser, 
  bulkImportUsers,
  changePassword
} from '../controllers/userController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { enforceTenantScope } from '../middleware/tenantScope';
import { 
  validateCreateUser, 
  validateUpdateUser, 
  validatePagination 
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get users (with tenant scoping)
router.get(
  '/',
  enforceTenantScope,
  validatePagination,
  getUsers
);

// Get single user (with tenant scoping)
router.get(
  '/:userId',
  enforceTenantScope,
  getUser
);

// Create user (factory admin and supervisors only)
router.post(
  '/',
  requireRole(['factory_admin', 'supervisor']),
  enforceTenantScope,
  validateCreateUser,
  createUser
);

// Update user
router.patch(
  '/:userId',
  requireRole(['factory_admin', 'supervisor']),
  enforceTenantScope,
  validateUpdateUser,
  updateUser
);

// Delete user (soft delete)
router.delete(
  '/:userId',
  requireRole(['factory_admin']),
  enforceTenantScope,
  deleteUser
);

// Bulk import users
router.post(
  '/bulk-import',
  requireRole(['factory_admin']),
  enforceTenantScope,
  bulkImportUsers
);

// Change password (users can change their own password)
router.post(
  '/:userId/change-password',
  (req, res, next) => {
    // Users can only change their own password
    if (req.user?.id !== req.params.userId && req.user?.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only change your own password',
      });
    }
    next();
  },
  changePassword
);

export default router;