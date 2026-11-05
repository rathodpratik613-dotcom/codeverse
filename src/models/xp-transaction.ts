import mongoose, { Schema } from 'mongoose';

const XpTransactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    sourceType: { type: String, enum: ['lesson', 'challenge', 'quiz', 'mission', 'achievement', 'streak'], required: true },
    sourceId: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

// Critical: Prevent duplicate XP awards for same source
XpTransactionSchema.index({ userId: 1, sourceType: 1, sourceId: 1 }, { unique: true });

export const XpTransaction = mongoose.models.XpTransaction || mongoose.model('XpTransaction', XpTransactionSchema);

const CoinTransactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    sourceType: { type: String, required: true },
    sourceId: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

CoinTransactionSchema.index({ userId: 1, sourceType: 1, sourceId: 1 }, { unique: true });

export const CoinTransaction = mongoose.models.CoinTransaction || mongoose.model('CoinTransaction', CoinTransactionSchema);
