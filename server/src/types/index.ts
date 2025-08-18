import { Document, Types } from 'mongoose';
import { Request } from 'express';

export type UserRole = 'super_admin' | 'factory_admin' | 'supervisor' | 'employee';

export interface IUser extends Document {
  autoId: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: UserRole;
  tenantId?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITenant extends Document {
  factoryName: string;
  address: string;
  workersCount: number;
  ownerEmail: string;
  phone: string;
  status: 'pending' | 'active' | 'rejected' | 'frozen';
  rejectionReason?: string;
  createdAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  updatedAt: Date;
}

export interface IProduct extends Document {
  tenantId: Types.ObjectId;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProcessStage extends Document {
  productId: Types.ObjectId;
  tenantId: Types.ObjectId;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask extends Document {
  tenantId: Types.ObjectId;
  employeeId: Types.ObjectId;
  productId: Types.ObjectId;
  processStageId: Types.ObjectId;
  targetQty: number;
  completedQty: number;
  status: 'active' | 'completed' | 'confirmed' | 'rejected' | 'overdue';
  deadlineWeek: string;
  deadline: Date;
  notes?: string;
  rejectionReason?: string;
  assignedBy: Types.ObjectId;
  assignedAt: Date;
  completedAt?: Date;
  confirmedAt?: Date;
  updatedAt: Date;
}

export interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    tenantId?: string | Types.ObjectId;
  };
  file?: Express.Multer.File;
}