import mongoose, { Schema } from 'mongoose';
import { IProduct } from '../types';

const productSchema = new Schema<IProduct>({
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
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
productSchema.index({ tenantId: 1, isActive: 1 });
productSchema.index({ tenantId: 1, name: 1 });

// Convert ObjectId to string in JSON output
productSchema.methods.toJSON = function() {
  const productObject = this.toObject();
  productObject._id = productObject._id.toString();
  if (productObject.tenantId) {
    productObject.tenantId = productObject.tenantId.toString();
  }
  return productObject;
};

export const Product = mongoose.model<IProduct>('Product', productSchema);