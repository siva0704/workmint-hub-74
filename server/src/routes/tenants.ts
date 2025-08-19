import { Router } from 'express';
import { 
  getTenants, 
  getTenant,
  updateTenant,
  approveTenant, 
  rejectTenant, 
  freezeTenant 
} from '../controllers/tenantController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validatePagination } from '../middleware/validation';
import { param, body } from 'express-validator';

const router = Router();

// Super Admin only routes
router.get(
  '/',
  authenticateToken,
  requireRole(['super_admin']),
  validatePagination,
  getTenants
);

// Factory Admin routes for their own tenant
router.get(
  '/:tenantId',
  authenticateToken,
  requireRole(['factory_admin']),
  getTenant
);

router.patch(
  '/:tenantId',
  authenticateToken,
  requireRole(['factory_admin']),
  updateTenant
);

router.post(
  '/:tenantId/approve',
  authenticateToken,
  requireRole(['super_admin']),
  param('tenantId').isMongoId(),
  body('reason').optional().trim(),
  approveTenant
);

router.post(
  '/:tenantId/reject',
  authenticateToken,
  requireRole(['super_admin']),
  param('tenantId').isMongoId(),
  body('reason').notEmpty().trim(),
  rejectTenant
);

router.post(
  '/:tenantId/freeze',
  authenticateToken,
  requireRole(['super_admin']),
  param('tenantId').isMongoId(),
  freezeTenant
);

export default router;