import mongoose from 'mongoose';

const HabitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    habitName: {
      type: String,
      required: [true, 'Please provide habit name'],
    },
    description: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
    category: {
      type: String,
      enum: ['Health', 'Productivity', 'Learning', 'Mindfulness', 'Other'],
      default: 'Other',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // ✅ NEW: Track when habit was last completed
    lastCompletedDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

HabitSchema.index({ userId: 1 });
HabitSchema.index({ userId: 1, habitName: 1 }, { unique: true });

export default mongoose.models.Habit || mongoose.model('Habit', HabitSchema);