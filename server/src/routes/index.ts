import { Router } from 'express';
import authRoutes from './auth';
import tenantRoutes from './tenants';
import userRoutes from './users';
import productRoutes from './products';
import taskRoutes from './tasks';
import uploadRoutes from './upload';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'WorkMint Hub API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/sa/tenants', tenantRoutes); // Super Admin tenant routes
router.use('/tenants', tenantRoutes); // Factory Admin tenant routes
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/tasks', taskRoutes);
router.use('/upload', uploadRoutes);

export default router;