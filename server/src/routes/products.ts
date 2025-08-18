import { Router } from 'express';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getProductStages,
  createProcessStage,
  updateProcessStage,
  reorderProcessStages,
  getProduct
} from '../controllers/productController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { enforceTenantScope } from '../middleware/tenantScope';
import { 
  validateCreateProduct, 
  validateUpdateProduct,
  validateCreateProcessStage,
  validatePagination 
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Product routes
router.get(
  '/',
  enforceTenantScope,
  validatePagination,
  getProducts
);

router.get(
  '/:productId',
  enforceTenantScope,
  getProduct
);

router.post(
  '/',
  requireRole(['factory_admin']),
  enforceTenantScope,
  validateCreateProduct,
  createProduct
);

router.patch(
  '/:productId',
  requireRole(['factory_admin']),
  enforceTenantScope,
  validateUpdateProduct,
  updateProduct
);

router.delete(
  '/:productId',
  requireRole(['factory_admin']),
  enforceTenantScope,
  deleteProduct
);

// Process stage routes
router.get(
  '/:productId/stages',
  enforceTenantScope,
  getProductStages
);

router.post(
  '/:productId/stages',
  requireRole(['factory_admin']),
  enforceTenantScope,
  validateCreateProcessStage,
  createProcessStage
);

router.patch(
  '/:productId/stages/:stageId',
  requireRole(['factory_admin']),
  enforceTenantScope,
  updateProcessStage
);

router.post(
  '/:productId/stages/reorder',
  requireRole(['factory_admin']),
  enforceTenantScope,
  reorderProcessStages
);

export default router;