import mongoose from 'mongoose';

const DailyLogSchema = new mongoose.Schema(
  {
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
    date: {
      type: Date,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

DailyLogSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });
DailyLogSchema.index({ userId: 1, date: 1 });
DailyLogSchema.index({ habitId: 1, date: 1 });

export default mongoose.models.DailyLog || mongoose.model('DailyLog', DailyLogSchema);