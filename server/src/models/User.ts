import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole } from '../types';
import { config } from '../config/environment';

const userSchema = new Schema<IUser>({
  autoId: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  role: {
    type: String,
    enum: ['super_admin', 'factory_admin', 'supervisor', 'employee'],
    required: true,
  },
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: function(this: IUser) {
      return this.role !== 'super_admin';
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, role: 1 });
userSchema.index({ autoId: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to generate auto ID
userSchema.statics.generateAutoId = async function(role: UserRole, tenantId?: string): Promise<string> {
  const prefix = role === 'employee' ? 'EMP' : role === 'supervisor' ? 'SUP' : 'ADM';
  
  // Find the highest existing auto ID for this role (ignore tenant for first user)
  const query: any = { role };
  if (tenantId) {
    // Convert string tenantId to ObjectId if needed
    const mongoose = await import('mongoose');
    query.tenantId = mongoose.Types.ObjectId.isValid(tenantId) ? tenantId : new mongoose.Types.ObjectId(tenantId);
  }
  
  const lastUser = await this.findOne(query).sort({ autoId: -1 });
  
  let nextNumber = 1;
  if (lastUser && lastUser.autoId) {
    const match = lastUser.autoId.match(/\d+$/);
    if (match) {
      nextNumber = parseInt(match[0]) + 1;
    }
  }
  
  // Generate a unique autoId with timestamp to avoid conflicts
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}${String(nextNumber).padStart(3, '0')}${timestamp}`;
};

// Remove password from JSON output and convert ObjectId to string
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  userObject._id = userObject._id.toString();
  if (userObject.tenantId) {
    userObject.tenantId = userObject.tenantId.toString();
  }
  return userObject;
};

export const User = mongoose.model<IUser>('User', userSchema);