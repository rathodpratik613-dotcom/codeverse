import mongoose, { Schema } from 'mongoose';

const SessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    isRememberMe: { type: Boolean, default: false },
    userAgent: { type: String },
    ipAddress: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SessionSchema.index({ token: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);
