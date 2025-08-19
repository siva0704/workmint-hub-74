import { Response } from 'express';
import { Task } from '../models/Task';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { ProcessStage } from '../models/ProcessStage';
import { AuthRequest } from '../types';
import { getCurrentIndianTime } from '../utils/timeUtils';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const employeeId = req.query.employeeId as string;
    const status = req.query.status as string;
    const week = req.query.week as string;

    const query: any = {};
    
    // Tenant scoping
    if (req.user?.role !== 'super_admin') {
      // Convert string tenantId to ObjectId for database query
      const mongoose = await import('mongoose');
      const effectiveTenantId = req.query.tenantId as string || req.user?.tenantId;
      query.tenantId = new mongoose.Types.ObjectId(effectiveTenantId);
    }

    // Role-based filtering
    if (req.user?.role === 'employee') {
      query.employeeId = req.user.id;
    } else if (req.user?.role === 'supervisor' && employeeId) {
      query.employeeId = employeeId;
    }

    if (status) query.status = status;
    if (week) query.deadlineWeek = week;

    const skip = (page - 1) * limit;
    
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('employeeId', 'name autoId')
        .populate('productId', 'name')
        .populate('processStageId', 'name')
        .populate('assignedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(query),
    ]);

    // Transform data to match frontend expectations
    const transformedTasks = tasks.map(task => ({
      id: task._id,
      tenantId: task.tenantId,
      employeeId: task.employeeId._id,
      employeeName: (task.employeeId as any).name,
      productId: task.productId._id,
      productName: (task.productId as any).name,
      processStageId: task.processStageId._id,
      processStageeName: (task.processStageId as any).name,
      targetQty: task.targetQty,
      completedQty: task.completedQty,
      progress: Math.min((task.completedQty / task.targetQty) * 100, 100),
      status: task.status,
      deadlineWeek: task.deadlineWeek,
      deadline: task.deadline.toISOString(),
      notes: task.notes,
      rejectionReason: task.rejectionReason,
      assignedBy: task.assignedBy,
      assignedAt: task.assignedAt.toISOString(),
      completedAt: task.completedAt?.toISOString(),
      confirmedAt: task.confirmedAt?.toISOString(),
    }));

    res.json({
      success: true,
      data: transformedTasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {

    const {
      employeeId,
      productId,
      processStageId,
      targetQty,
      deadlineWeek,
      deadline,
      notes,
    } = req.body;

    // Verify employee exists and belongs to same tenant
    const employee = await User.findById(employeeId);
    if (!employee || employee.tenantId?.toString() !== req.user?.tenantId?.toString()) {
      res.status(400).json({
        success: false,
        message: 'Invalid employee - Employee not found in your factory',
      });
      return;
    }

    // Verify product exists and belongs to same tenant
    const product = await Product.findById(productId);
    if (!product || product.tenantId.toString() !== req.user?.tenantId?.toString()) {
      res.status(400).json({
        success: false,
        message: 'Invalid product - Product not found in your factory',
      });
      return;
    }

    // Verify process stage exists and belongs to the product
    const processStage = await ProcessStage.findOne({ 
      _id: processStageId, 
      productId,
      tenantId: req.user?.tenantId 
    });
    if (!processStage) {
      res.status(400).json({
        success: false,
        message: 'Invalid process stage',
      });
      return;
    }

    const task = await Task.create({
      tenantId: req.user?.tenantId,
      employeeId,
      productId,
      processStageId,
      targetQty,
      completedQty: 0,
      status: 'active',
      deadlineWeek,
      deadline: new Date(deadline),
      notes,
      assignedBy: req.user?.id,
      assignedAt: getCurrentIndianTime(),
    });

    res.status(201).json({
      success: true,
      message: 'Task assigned successfully',
      data: { task },
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const updateTaskProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { completedQty } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    // Check access - employee can only update their own tasks
    if (req.user?.role === 'employee' && task.employeeId.toString() !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    // Check tenant access
    if (req.user?.role !== 'super_admin' && task.tenantId.toString() !== req.user?.tenantId?.toString()) {
      res.status(403).json({
        success: false,
        message: 'Access denied - Task not found in your factory',
      });
      return;
    }

    // Validate completed quantity
    if (completedQty > task.targetQty) {
      res.status(400).json({
        success: false,
        message: 'Completed quantity cannot exceed target quantity',
      });
      return;
    }

    task.completedQty = completedQty;
    
    // Update status based on completion
    if (completedQty >= task.targetQty) {
      task.status = 'completed';
      task.completedAt = getCurrentIndianTime();
    }

    await task.save();

    res.json({
      success: true,
      message: 'Task progress updated successfully',
      data: task,
    });
  } catch (error) {
    console.error('Update task progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const confirmTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { confirmedQty } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    // Only supervisors can confirm tasks
    if (req.user?.role !== 'supervisor' && req.user?.role !== 'factory_admin') {
      res.status(403).json({
        success: false,
        message: 'Only supervisors can confirm tasks',
      });
      return;
    }

    // Check tenant access
    if (task.tenantId.toString() !== req.user?.tenantId?.toString()) {
      res.status(403).json({
        success: false,
        message: 'Access denied - Task not found in your factory',
      });
      return;
    }

    const finalQty = confirmedQty || task.completedQty;
    
    task.completedQty = finalQty;
    task.status = 'confirmed';
    task.confirmedAt = getCurrentIndianTime();
    await task.save();

    // Create residual task if partial confirmation
    let residualTask = null;
    if (finalQty < task.targetQty) {
      residualTask = await Task.create({
        tenantId: task.tenantId,
        employeeId: task.employeeId,
        productId: task.productId,
        processStageId: task.processStageId,
        targetQty: task.targetQty - finalQty,
        completedQty: 0,
        status: 'active',
        deadlineWeek: task.deadlineWeek,
        deadline: task.deadline,
        notes: `Residual task from partial completion. Original task: ${task._id}`,
        assignedBy: req.user?.id,
        assignedAt: getCurrentIndianTime(),
      });
    }

    res.json({
      success: true,
      message: 'Task confirmed successfully',
      data: {
        task,
        residualTask,
      },
    });
  } catch (error) {
    console.error('Confirm task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const rejectTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
      return;
    }

    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    // Only supervisors can reject tasks
    if (req.user?.role !== 'supervisor' && req.user?.role !== 'factory_admin') {
      res.status(403).json({
        success: false,
        message: 'Only supervisors can reject tasks',
      });
      return;
    }

    // Check tenant access
    if (task.tenantId.toString() !== req.user?.tenantId?.toString()) {
      res.status(403).json({
        success: false,
        message: 'Access denied - Task not found in your factory',
      });
      return;
    }

    task.status = 'rejected';
    task.rejectionReason = reason;
    await task.save();

    res.json({
      success: true,
      message: 'Task rejected successfully',
      data: task,
    });
  } catch (error) {
    console.error('Reject task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    // Only supervisors and factory admins can delete tasks
    if (req.user?.role !== 'supervisor' && req.user?.role !== 'factory_admin') {
      res.status(403).json({
        success: false,
        message: 'Only supervisors and factory admins can delete tasks',
      });
      return;
    }

    // Check tenant access
    if (task.tenantId.toString() !== req.user?.tenantId?.toString()) {
      res.status(403).json({
        success: false,
        message: 'Access denied - Task not found in your factory',
      });
      return;
    }

    // Only allow deletion of active or pending tasks
    if (task.status === 'confirmed' || task.status === 'completed') {
      res.status(400).json({
        success: false,
        message: 'Cannot delete confirmed or completed tasks',
      });
      return;
    }

    await Task.findByIdAndDelete(taskId);

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};