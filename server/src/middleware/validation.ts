import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
    return;
  }
  next();
};

// Auth validation
export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  handleValidationErrors,
];

export const validateSignup = [
  body('factoryName').trim().isLength({ min: 2 }),
  body('address').trim().isLength({ min: 10 }),
  body('workersCount').isInt({ min: 1 }),
  body('ownerEmail').isEmail().normalizeEmail(),
  body('phone').isMobilePhone('any'),
  body('loginEmail').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  body('acceptTerms').equals('true'),
  handleValidationErrors,
];

// User validation
export const validateCreateUser = [
  body('name').trim().isLength({ min: 2 }),
  body('mobile').isMobilePhone('any'),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').isIn(['factory_admin', 'supervisor', 'employee']),
  body('password').isLength({ min: 8 }),
  handleValidationErrors,
];

export const validateUpdateUser = [
  param('userId').isMongoId(),
  body('name').optional().trim().isLength({ min: 2 }),
  body('mobile').optional().isMobilePhone('any'),
  body('email').optional().isEmail().normalizeEmail(),
  body('isActive').optional().isBoolean(),
  handleValidationErrors,
];

// Product validation
export const validateCreateProduct = [
  body('name').trim().isLength({ min: 2 }),
  body('description').trim().isLength({ min: 10 }),
  handleValidationErrors,
];

export const validateUpdateProduct = [
  param('productId').isMongoId(),
  body('name').optional().trim().isLength({ min: 2 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('isActive').optional().isBoolean(),
  handleValidationErrors,
];

// Task validation
export const validateCreateTask = [
  body('employeeId').isMongoId(),
  body('productId').isMongoId(),
  body('processStageId').isMongoId(),
  body('targetQty').isInt({ min: 1 }),
  body('deadlineWeek').matches(/^\d{4}-W\d{2}$/),
  body('deadline').isISO8601(),
  body('notes').optional().trim(),
  handleValidationErrors,
];

export const validateUpdateTaskProgress = [
  param('taskId').isMongoId(),
  body('completedQty').isInt({ min: 0 }),
  handleValidationErrors,
];

// Process stage validation
export const validateCreateProcessStage = [
  body('name').trim().isLength({ min: 2 }),
  body('description').trim().isLength({ min: 5 }),
  body('order').isInt({ min: 1 }),
  handleValidationErrors,
];

// Pagination validation
export const validatePagination = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors,
];