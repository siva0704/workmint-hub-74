import mongoose, { Schema } from 'mongoose';
import { ITenant } from '../types';

const tenantSchema = new Schema<ITenant>({
  factoryName: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  workersCount: {
    type: Number,
    required: true,
    min: 1,
  },
  ownerEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'rejected', 'frozen'],
    default: 'pending',
  },
  rejectionReason: {
    type: String,
    trim: true,
  },
  approvedAt: {
    type: Date,
  },
  rejectedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes
tenantSchema.index({ status: 1 });
tenantSchema.index({ ownerEmail: 1 });
tenantSchema.index({ createdAt: -1 });

export const Tenant = mongoose.model<ITenant>('Tenant', tenantSchema);