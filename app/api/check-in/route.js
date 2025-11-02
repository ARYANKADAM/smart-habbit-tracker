import dbConnect from '@/lib/mongodb';
import Habit from '@/models/Habit';
import DailyLog from '@/models/DailyLog';
import { updateStreakAfterCheckIn } from '@/lib/streakCalculator';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { DateTime } from 'luxon';

export async function POST(request) {
  try {
    await dbConnect();

    const userId = await getCurrentUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { habitId, completed, date, timezone } = await request.json();
    if (!habitId) return NextResponse.json({ error: 'Habit ID required' }, { status: 400 });
    if (completed === undefined)
      return NextResponse.json({ error: 'Completed status required' }, { status: 400 });

    const userTimezone = timezone || 'Asia/Kolkata';
    const logDate = date
      ? DateTime.fromISO(date, { zone: userTimezone }).startOf('day').toJSDate()
      : DateTime.now().setZone(userTimezone).startOf('day').toJSDate();

    // Create/update daily log
    await DailyLog.findOneAndUpdate(
      { userId, habitId, date: logDate },
      { completed },
      { new: true, upsert: true }
    );

    // ✅ NEW: Update the Habit's lastCompletedDate field
    // In app/api/check-in/route.js, add this after line 43:
if (completed) {
  const updatedHabit = await Habit.findOneAndUpdate(
    { _id: habitId, userId },
    { 
      $set: { 
        lastCompletedDate: logDate 
      } 
    },
    { new: true } // Return updated document
  );
  
  console.log('✅ Updated habit in DB:', {
    habitId,
    logDate: logDate.toISOString(),
    savedLastCompletedDate: updatedHabit.lastCompletedDate?.toISOString(),
    match: logDate.getTime() === updatedHabit.lastCompletedDate?.getTime()
  });
}

    // Update streak
    const streak = await updateStreakAfterCheckIn(habitId, completed, userTimezone);

    // Check for new achievements when habit is completed
    let newAchievements = [];
    if (completed) {
      try {
        // Import achievement checking function dynamically to avoid circular imports
        const { checkForNewAchievements } = await import('@/lib/achievementChecker');
        newAchievements = await checkForNewAchievements(userId);
      } catch (achievementError) {
        console.log('Achievement check failed (non-critical):', achievementError);
      }
    }

    // Return completedToday flag so frontend can update immediately
    return NextResponse.json({ 
      streak, 
      completedToday: completed,
      newAchievements
    }, { status: 200 });
  } catch (error) {
    console.error('Check-in API error:', error);
    return NextResponse.json({ error: 'Failed to check in' }, { status: 500 });
  }
}