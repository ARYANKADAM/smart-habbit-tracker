import Streak from '@/models/Streaks';
import DailyLog from '@/models/DailyLog';
import Habit from '@/models/Habit';
import { DateTime } from 'luxon';

export async function updateStreakAfterCheckIn(habitId, completed, timezone = 'Asia/Kolkata') {
  // Get streak record or create if not exists
  let streak = await Streak.findOne({ habitId });
  if (!streak) {
    streak = new Streak({ habitId });
  }

  const today = DateTime.now().setZone(timezone).startOf('day').toJSDate();

  if (completed) {
    // Check if lastCompletedDate was yesterday
    let lastDate = streak.lastCompletedDate ? DateTime.fromJSDate(streak.lastCompletedDate).setZone(timezone).startOf('day') : null;
    if (lastDate && lastDate.plus({ days: 1 }).hasSame(DateTime.now().setZone(timezone).startOf('day'), 'day')) {
      streak.currentStreak += 1;
    } else if (!lastDate || lastDate < DateTime.now().setZone(timezone).startOf('day').minus({ days: 1 })) {
      streak.currentStreak = 1; // reset streak
    }
    if (streak.currentStreak > streak.longestStreak) streak.longestStreak = streak.currentStreak;
    streak.lastCompletedDate = today;
  } else {
    streak.currentStreak = 0;
  }

  await streak.save();
  return { currentStreak: streak.currentStreak, longestStreak: streak.longestStreak };
}
