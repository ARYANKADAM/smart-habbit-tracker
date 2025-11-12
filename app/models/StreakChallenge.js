import mongoose from 'mongoose';

const StreakChallengeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
  },
  targetDays: {
    type: Number,
    required: true,
    min: 3,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'failed'],
    default: 'active',
  },
  lastCheckInDate: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
}, { timestamps: true });

// Index for efficient queries
StreakChallengeSchema.index({ userId: 1, status: 1 });
StreakChallengeSchema.index({ habitId: 1 });

export default mongoose.models.StreakChallenge || mongoose.model('StreakChallenge', StreakChallengeSchema);
