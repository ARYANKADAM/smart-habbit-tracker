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

    // Verify habit exists and is active
    const habit = await Habit.findOne({ _id: habitId, userId, isActive: true });
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found or inactive' }, { status: 404 });
    }

    const userTimezone = timezone || 'Asia/Kolkata';
    const logDate = date
      ? DateTime.fromISO(date, { zone: userTimezone }).startOf('day').toJSDate()
      : DateTime.now().setZone(userTimezone).startOf('day').toJSDate();

    // Create/update daily log
    const dailyLog = await DailyLog.findOneAndUpdate(
      { userId, habitId, date: logDate },
      { completed },
      { new: true, upsert: true }
    );

    // Update habit last completed date
    let updatedHabit = null;
    if (completed) {
      updatedHabit = await Habit.findOneAndUpdate(
        { _id: habitId, userId },
        { 
          $set: { 
            lastCompletedDate: logDate 
          } 
        },
        { new: true }
      );
    }

    // Update streak
    const streak = await updateStreakAfterCheckIn(habitId, completed, userTimezone);

    // Update goals and challenges progress
    if (completed) {
      // Update goals for this habit
      const { updateGoalsAfterCheckIn } = await import('@/api/goals/route');
      await updateGoalsAfterCheckIn(habitId, userId);
      
      // Update challenges for this habit
      const { updateChallengesAfterCheckIn } = await import('@/api/challenges/route');
      await updateChallengesAfterCheckIn(habitId, userId);
    }

    // Return completedToday flag so frontend can update immediately
    return NextResponse.json({ 
      streak, 
      completedToday: completed
    }, { status: 200 });
  } catch (error) {
    console.error('Check-in API error:', error);
    return NextResponse.json({ error: 'Failed to check in' }, { status: 500 });
  }
}