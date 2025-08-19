import mongoose, { Schema } from 'mongoose';
import { IProcessStage } from '../types';

const processStageSchema = new Schema<IProcessStage>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  order: {
    type: Number,
    required: true,
    min: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
processStageSchema.index({ productId: 1, order: 1 });
processStageSchema.index({ tenantId: 1 });

// Convert ObjectId to string in JSON output
processStageSchema.methods.toJSON = function() {
  const stageObject = this.toObject();
  stageObject._id = stageObject._id.toString();
  if (stageObject.productId) {
    stageObject.productId = stageObject.productId.toString();
  }
  if (stageObject.tenantId) {
    stageObject.tenantId = stageObject.tenantId.toString();
  }
  return stageObject;
};

export const ProcessStage = mongoose.model<IProcessStage>('ProcessStage', processStageSchema);