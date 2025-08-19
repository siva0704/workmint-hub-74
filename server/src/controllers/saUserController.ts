import { Response } from 'express';
import { User } from '../models/User';
import { Tenant } from '../models/Tenant';
import { Task } from '../models/Task';
import { AuthRequest } from '../types';
import mongoose from 'mongoose';

export const updateSuperAdminProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { name, email, mobile } = req.body;

    console.log('updateSuperAdminProfile called with userId:', userId);
    console.log('req.user:', req.user);
    console.log('updates:', { name, email, mobile });

    // Validate required fields
    if (!name || !email || !mobile) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and mobile are required',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
      return;
    }

    // Validate mobile format (basic validation)
    if (mobile.length < 10) {
      res.status(400).json({
        success: false,
        message: 'Mobile number must be at least 10 digits',
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log('SuperAdmin user not found for ID:', userId);
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Verify this is a super_admin user
    if (user.role !== 'super_admin') {
      res.status(403).json({
        success: false,
        message: 'This endpoint is only for SuperAdmin users',
      });
      return;
    }

    console.log('Found SuperAdmin user:', user.toJSON());

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: userId } 
    });
    
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Email is already taken by another user',
      });
      return;
    }

    // Update user fields
    user.name = name;
    user.email = email;
    user.mobile = mobile;
    user.updatedAt = new Date();

    await user.save();

    console.log('SuperAdmin profile updated successfully');

    res.json({
      success: true,
      message: 'SuperAdmin profile updated successfully',
      data: user.toJSON(),
    });
  } catch (error) {
    console.error('Update SuperAdmin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getSystemStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('getSystemStats called by SuperAdmin:', req.user?.id);

    // Get real-time system statistics
    const [
      totalTenants,
      totalUsers,
      pendingTenants,
      activeTenants,
      totalTasks,
      completedTasks,
      systemUptime,
      storageUsed,
      activeConnections,
      systemLoad
    ] = await Promise.all([
      // Total tenants
      Tenant.countDocuments(),
      
      // Total users
      User.countDocuments(),
      
      // Pending tenants (not approved)
      Tenant.countDocuments({ status: 'pending' }),
      
      // Active tenants (approved)
      Tenant.countDocuments({ status: 'active' }),
      
      // Total tasks
      Task.countDocuments(),
      
      // Completed tasks
      Task.countDocuments({ status: 'completed' }),
      
      // System uptime (mock for now - could be calculated from server start time)
      Promise.resolve('99.9%'),
      
      // Storage used (mock for now - could be calculated from database size)
      Promise.resolve('2.3 TB'),
      
      // Active connections (mock for now - could be tracked in real-time)
      Promise.resolve(847),
      
      // System load (mock for now - could be calculated from CPU usage)
      Promise.resolve(78)
    ]);

    const stats = {
      totalTenants,
      totalUsers,
      systemUptime,
      storageUsed,
      activeConnections,
      pendingTenants,
      activeTenants,
      totalTasks,
      completedTasks,
      systemLoad,
    };

    console.log('System stats calculated:', stats);

    res.json({
      success: true,
      data: stats,
      message: 'System statistics retrieved successfully',
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
