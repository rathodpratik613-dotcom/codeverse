import mongoose, { Schema } from 'mongoose';

const LessonProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contentId: { type: String, required: true },
    contentType: { type: String, enum: ['lesson', 'quiz', 'challenge', 'debug', 'puzzle'], required: true },
    languageSlug: { type: String, required: true },
    moduleId: { type: String },
    status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
    completedAt: { type: Date },
    timeSpent: { type: Number, default: 0 }, // in seconds
    lastPosition: { type: Schema.Types.Mixed },
    score: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

LessonProgressSchema.index({ userId: 1, contentId: 1 }, { unique: true });
LessonProgressSchema.index({ userId: 1, languageSlug: 1 });

export const LessonProgress = mongoose.models.LessonProgress || mongoose.model('LessonProgress', LessonProgressSchema);
