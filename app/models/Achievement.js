import mongoose from 'mongoose';

const AchievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    achievementId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['streaks', 'completion', 'consistency', 'milestones', 'special'],
      required: true,
    },
    points: {
      type: Number,
      default: 10,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
AchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
AchievementSchema.index({ userId: 1, category: 1 });

export default mongoose.models.Achievement || mongoose.model('Achievement', AchievementSchema);