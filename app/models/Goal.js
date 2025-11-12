import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
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
  targetCount: {
    type: Number,
    required: true,
    min: 1,
  },
  period: {
    type: String,
    enum: ['weekly', 'monthly'],
    required: true,
  },
  currentProgress: {
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
  completedAt: {
    type: Date,
  },
}, { timestamps: true });

// Index for efficient queries
GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ habitId: 1 });

export default mongoose.models.Goal || mongoose.model('Goal', GoalSchema);
