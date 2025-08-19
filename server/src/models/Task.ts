import mongoose, { Schema } from 'mongoose';
import { ITask } from '../types';

const taskSchema = new Schema<ITask>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  processStageId: {
    type: Schema.Types.ObjectId,
    ref: 'ProcessStage',
    required: true,
  },
  targetQty: {
    type: Number,
    required: true,
    min: 1,
  },
  completedQty: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'confirmed', 'rejected', 'overdue'],
    default: 'active',
  },
  deadlineWeek: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  rejectionReason: {
    type: String,
    trim: true,
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedAt: {
    type: Date,
    default: () => new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"})),
  },
  completedAt: {
    type: Date,
  },
  confirmedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for performance
taskSchema.index({ tenantId: 1, status: 1 });
taskSchema.index({ employeeId: 1, status: 1 });
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ deadline: 1 });
taskSchema.index({ deadlineWeek: 1 });

// Virtual for progress calculation
taskSchema.virtual('progress').get(function() {
  return Math.min((this.completedQty / this.targetQty) * 100, 100);
});

// Convert ObjectId to string in JSON output
taskSchema.methods.toJSON = function() {
  const taskObject = this.toObject();
  taskObject._id = taskObject._id.toString();
  if (taskObject.tenantId) {
    taskObject.tenantId = taskObject.tenantId.toString();
  }
  if (taskObject.employeeId) {
    taskObject.employeeId = taskObject.employeeId.toString();
  }
  if (taskObject.productId) {
    taskObject.productId = taskObject.productId.toString();
  }
  if (taskObject.processStageId) {
    taskObject.processStageId = taskObject.processStageId.toString();
  }
  if (taskObject.assignedBy) {
    taskObject.assignedBy = taskObject.assignedBy.toString();
  }
  return taskObject;
};

export const Task = mongoose.model<ITask>('Task', taskSchema);