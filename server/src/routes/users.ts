import { Router } from 'express';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  bulkImportUsers 
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

export default router;