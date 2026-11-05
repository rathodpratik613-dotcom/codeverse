import mongoose, { Schema } from 'mongoose';

const EditorDraftSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contentId: { type: String, required: true },
    contentType: { type: String, enum: ['lesson', 'challenge', 'playground'], required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    isAutosaved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

EditorDraftSchema.index({ userId: 1, contentId: 1 }, { unique: true });

export const EditorDraft = mongoose.models.EditorDraft || mongoose.model('EditorDraft', EditorDraftSchema);
