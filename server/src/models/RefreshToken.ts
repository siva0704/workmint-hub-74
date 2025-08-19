import mongoose, { Schema } from 'mongoose';
import { IRefreshToken } from '../types';

const refreshTokenSchema = new Schema<IRefreshToken>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

// Index for cleanup
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ userId: 1 });

// Convert ObjectId to string in JSON output
refreshTokenSchema.methods.toJSON = function() {
  const tokenObject = this.toObject();
  tokenObject._id = tokenObject._id.toString();
  if (tokenObject.userId) {
    tokenObject.userId = tokenObject.userId.toString();
  }
  return tokenObject;
};

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);