import mongoose, { Schema } from 'mongoose';

const ChallengeSubmissionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contentId: { type: String, required: true },
    contentType: { type: String, default: 'challenge' },
    language: { type: String, required: true },
    code: { type: String, required: true },
    result: { type: String, enum: ['passed', 'failed', 'error'], required: true },
    testsPassed: { type: Number, default: 0 },
    testsTotal: { type: Number, default: 0 },
    runtime: { type: Number }, // in ms
    isBestSolution: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ChallengeSubmissionSchema.index({ userId: 1, contentId: 1 });

export const ChallengeSubmission = mongoose.models.ChallengeSubmission || mongoose.model('ChallengeSubmission', ChallengeSubmissionSchema);
