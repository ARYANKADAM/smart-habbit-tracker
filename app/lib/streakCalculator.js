import Streak from '@/models/Streaks';
import DailyLog from '@/models/DailyLog';
import Habit from '@/models/Habit';
import { DateTime } from 'luxon';

export async function updateStreakAfterCheckIn(habitId, completed, timezone = 'Asia/Kolkata') {
  // Get all completed logs to recalculate streak accurately
  const logs = await DailyLog.find({ 
    habitId, 
    completed: true 
  }).sort({ date: 1 }).lean();

  // Get or create streak record
  let streak = await Streak.findOne({ habitId });
  if (!streak) {
    streak = new Streak({ habitId });
  }

  if (logs.length === 0) {
    // No completed logs, reset streak
    streak.currentStreak = 0;
    streak.lastCompletedDate = null;
    await streak.save();
    return { currentStreak: 0, longestStreak: streak.longestStreak };
  }

  const now = DateTime.now().setZone(timezone).startOf('day');
  let currentStreak = 0;
  let longestStreak = streak.longestStreak || 0;
  let tempStreak = 0;
  let lastLogDate = null;

  // Calculate streaks from all logs
  for (let i = 0; i < logs.length; i++) {
    const logDate = DateTime.fromJSDate(logs[i].date).setZone(timezone).startOf('day');
    
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = DateTime.fromJSDate(logs[i - 1].date).setZone(timezone).startOf('day');
      const daysDiff = logDate.diff(prevDate, 'days').days;
      
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }

    // Track longest streak ever
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    // Current streak is the one that includes today or yesterday
    const daysSinceLog = now.diff(logDate, 'days').days;
    if (daysSinceLog <= 1) {
      currentStreak = tempStreak;
      lastLogDate = logDate.toJSDate();
    }
  }

  // Update streak record
  streak.currentStreak = currentStreak;
  streak.longestStreak = longestStreak;
  streak.lastCompletedDate = lastLogDate;

  await streak.save();
  return { currentStreak, longestStreak };
}
