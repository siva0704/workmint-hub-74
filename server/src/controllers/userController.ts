import { Response } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../types';

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const tenantId = req.query.tenantId as string;

    const query: any = {};
    
    // Tenant scoping
    if (req.user?.role !== 'super_admin') {
      query.tenantId = req.user?.tenantId;
    } else if (tenantId) {
      query.tenantId = tenantId;
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

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, mobile, role, password } = req.body;
    const tenantId = req.user?.tenantId;

    // Check if email already exists
    if (email) {
      const existingUser = await User.findOne({ email });
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
      email: email || `${autoId.toLowerCase()}@${tenantId}.local`,
      mobile,
      password,
      role,
      tenantId,
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

    // Remove sensitive fields from updates
    delete updates.password;
    delete updates.role;
    delete updates.tenantId;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check tenant access
    if (req.user?.role !== 'super_admin' && user.tenantId?.toString() !== req.user?.tenantId) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    Object.assign(user, updates);
    await user.save();

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
    if (req.user?.role !== 'super_admin' && user.tenantId?.toString() !== req.user?.tenantId) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
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