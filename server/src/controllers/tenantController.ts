import { Response } from 'express';
import { Tenant } from '../models/Tenant';
import { User } from '../models/User';
import { AuthRequest } from '../types';

export const getTenants = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const query: any = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    
    const [tenants, total] = await Promise.all([
      Tenant.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Tenant.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: tenants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const approveTenant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tenantId } = req.params;
    const { reason } = req.body;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
      return;
    }

    if (tenant.status !== 'pending') {
      res.status(400).json({
        success: false,
        message: 'Tenant is not pending approval',
      });
      return;
    }

    // Update tenant status
    tenant.status = 'active';
    tenant.approvedAt = new Date();
    await tenant.save();

    // Activate factory admin user
    await User.updateOne(
      { tenantId: tenant._id, role: 'factory_admin' },
      { isActive: true }
    );

    res.json({
      success: true,
      message: 'Tenant approved successfully',
      data: tenant,
    });
  } catch (error) {
    console.error('Approve tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const rejectTenant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tenantId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
      return;
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
      return;
    }

    // Update tenant status
    tenant.status = 'rejected';
    tenant.rejectionReason = reason;
    tenant.rejectedAt = new Date();
    await tenant.save();

    res.json({
      success: true,
      message: 'Tenant rejected',
      data: tenant,
    });
  } catch (error) {
    console.error('Reject tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const freezeTenant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tenantId } = req.params;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
      return;
    }

    // Toggle freeze status
    tenant.status = tenant.status === 'frozen' ? 'active' : 'frozen';
    await tenant.save();

    // Update user active status based on tenant status
    await User.updateMany(
      { tenantId: tenant._id },
      { isActive: tenant.status === 'active' }
    );

    res.json({
      success: true,
      message: `Tenant ${tenant.status === 'frozen' ? 'frozen' : 'activated'}`,
      data: tenant,
    });
  } catch (error) {
    console.error('Freeze tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};