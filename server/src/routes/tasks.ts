import { Router } from 'express';
import { 
  getTasks, 
  createTask, 
  updateTaskProgress, 
  confirmTask, 
  rejectTask 
} from '../controllers/taskController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { enforceTenantScope } from '../middleware/tenantScope';
import { 
  validateCreateTask, 
  validateUpdateTaskProgress,
  validatePagination 
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get tasks (role-based filtering applied in controller)
router.get(
  '/',
  enforceTenantScope,
  validatePagination,
  getTasks
);

// Create task (supervisors and factory admins only)
router.post(
  '/',
  requireRole(['supervisor', 'factory_admin']),
  enforceTenantScope,
  validateCreateTask,
  createTask
);

// Update task progress (employees can update their own tasks)
router.patch(
  '/:taskId/complete',
  validateUpdateTaskProgress,
  updateTaskProgress
);

// Confirm task (supervisors only)
router.post(
  '/:taskId/confirm',
  requireRole(['supervisor', 'factory_admin']),
  enforceTenantScope,
  confirmTask
);

// Reject task (supervisors only)
router.post(
  '/:taskId/reject',
  requireRole(['supervisor', 'factory_admin']),
  enforceTenantScope,
  rejectTask
);

export default router;