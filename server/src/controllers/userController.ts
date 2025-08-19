import { Response } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../types';
import mongoose from 'mongoose';

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const tenantId = req.query.tenantId as string;

    const query: any = {};
    
    // Tenant scoping - use tenantId from middleware or user
    if (req.user?.role !== 'super_admin') {
      // Convert string tenantId to ObjectId for database query
      const mongoose = await import('mongoose');
      const effectiveTenantId = tenantId || req.user?.tenantId;
      query.tenantId = new mongoose.Types.ObjectId(effectiveTenantId);
    } else if (tenantId) {
      const mongoose = await import('mongoose');
      query.tenantId = new mongoose.Types.ObjectId(tenantId);
    }

    if (role) query.role = role;

    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .populate('tenantId', 'factoryName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const tenantId = req.query.tenantId as string;

    const query: any = { _id: userId };
    
    // Tenant scoping - use tenantId from middleware or user
    if (req.user?.role !== 'super_admin') {
      // Convert string tenantId to ObjectId for database query
      const effectiveTenantId = tenantId || req.user?.tenantId;
      query.tenantId = new mongoose.Types.ObjectId(effectiveTenantId);
    } else if (tenantId) {
      query.tenantId = new mongoose.Types.ObjectId(tenantId);
    }

    const user = await User.findOne(query).populate('tenantId', 'factoryName');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: user.toJSON(),
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {

    const { name, email, mobile, role, password } = req.body;
    const tenantId = req.user?.tenantId;

    // Check if email already exists (only if email is provided)
    if (email && email.trim()) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
        return;
      }
    }

    // Generate auto ID
    const autoId = await (User as any).generateAutoId(role, tenantId);

    // Create user
    const user = await User.create({
      autoId,
      name,
      email: email && email.trim() ? email.toLowerCase() : `${autoId.toLowerCase()}@${tenantId}.local`,
      mobile,
      password,
      role,
      tenantId: new mongoose.Types.ObjectId(tenantId),
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: user.toJSON(),
        autoId,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    console.log('updateUser called with userId:', userId);
    console.log('req.user:', req.user);
    console.log('updates:', updates);

    // Remove sensitive fields from updates
    delete updates.password;
    delete updates.role;
    delete updates.tenantId;

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found for ID:', userId);
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    console.log('Found user:', user.toJSON());

    // Check tenant access
    if (req.user?.role !== 'super_admin' && user.tenantId?.toString() !== req.user?.tenantId?.toString()) {
      console.log('Access denied - tenant mismatch');
      console.log('user.tenantId:', user.tenantId?.toString());
      console.log('req.user?.tenantId:', req.user?.tenantId?.toString());
      res.status(403).json({
        success: false,
        message: 'Access denied - User not found in your factory',
      });
      return;
    }

    Object.assign(user, updates);
    await user.save();

    console.log('User updated successfully');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user.toJSON(),
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    console.log('changePassword called with userId:', userId);
    console.log('req.user:', req.user);

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long',
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found for password change:', userId);
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    console.log('Found user for password change:', user.toJSON());

    // Check tenant access
    if (req.user?.role !== 'super_admin' && user.tenantId?.toString() !== req.user?.tenantId?.toString()) {
      console.log('Access denied for password change - tenant mismatch');
      res.status(403).json({
        success: false,
        message: 'Access denied - User not found in your factory',
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await (user as any).comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      console.log('Current password is incorrect for user:', userId);
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log('Password changed successfully for user:', userId);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check tenant access
    if (req.user?.role !== 'super_admin' && user.tenantId?.toString() !== req.user?.tenantId?.toString()) {
      res.status(403).json({
        success: false,
        message: 'Access denied - User not found in your factory',
      });
      return;
    }

    // Soft delete by deactivating
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const bulkImportUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { users } = req.body;
    const tenantId = req.user?.tenantId;

    if (!Array.isArray(users) || users.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Users array is required',
      });
      return;
    }

    const results = {
      success: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < users.length; i++) {
      try {
        const userData = users[i];
        
        // Generate auto ID
        const autoId = await (User as any).generateAutoId(userData.role, tenantId);

        await User.create({
          autoId,
          name: userData.name,
          email: userData.email || `${autoId.toLowerCase()}@${tenantId}.local`,
          mobile: userData.mobile,
          password: userData.password || 'defaultPassword123',
          role: userData.role,
          tenantId,
          isActive: true,
        });

        results.success++;
      } catch (error) {
        results.errors.push(`Row ${i + 1}: ${error}`);
      }
    }

    res.json({
      success: true,
      message: 'Bulk import completed',
      data: results,
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};