import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

export const enforceTenantScope = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Super admin can access all tenants
  if (req.user?.role === 'super_admin') {
    return next();
  }

  // All other roles must have a tenant
  if (!req.user?.tenantId) {
    res.status(403).json({ 
      success: false, 
      message: 'Tenant access required' 
    });
    return;
  }

  // Add tenant filter to query parameters
  if (req.method === 'GET') {
    // ensure string type for query assignment
    (req.query as any).tenantId = String(req.user.tenantId);
  }

  // Add tenant ID to request body for create/update operations
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    req.body.tenantId = req.user.tenantId;
  }

  next();
};

export const validateTenantAccess = (resourceTenantId: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Super admin can access all resources
    if (req.user?.role === 'super_admin') {
      return next();
    }

    // Check if user belongs to the same tenant as the resource
    if (req.user?.tenantId !== resourceTenantId) {
      res.status(403).json({ 
        success: false, 
        message: 'Access denied: Resource belongs to different tenant' 
      });
      return;
    }

    next();
  };
};