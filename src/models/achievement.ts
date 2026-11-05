import mongoose, { Schema } from 'mongoose';

const UserAchievementSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    achievementId: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

export const UserAchievement = mongoose.models.UserAchievement || mongoose.model('UserAchievement', UserAchievementSchema);

const BookmarkSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contentId: { type: String, required: true },
    contentType: { type: String, required: true },
    title: { type: String, required: true },
    languageSlug: { type: String },
    note: { type: String },
  },
  { timestamps: true }
);

BookmarkSchema.index({ userId: 1, contentId: 1 }, { unique: true });

export const Bookmark = mongoose.models.Bookmark || mongoose.model('Bookmark', BookmarkSchema);

const NoteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contentId: { type: String, required: true },
    contentType: { type: String },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

NoteSchema.index({ userId: 1, contentId: 1 });

export const Note = mongoose.models.Note || mongoose.model('Note', NoteSchema);
