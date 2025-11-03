import dbConnect from '@/lib/mongodb';
import Habit from '@/models/Habit';
import DailyLog from '@/models/DailyLog';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { DateTime } from 'luxon';

export async function GET() {
  try {
    await dbConnect();
    const userId = await getCurrentUser();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active habits only
    const habits = await Habit.find({ userId, isActive: true });
    const activeHabitIds = habits.map(h => h._id);

    // Get logs for active habits only in last 7 days
    const oneWeekAgo = DateTime.now().setZone('Asia/Kolkata').minus({ days: 7 }).startOf('day');
    const recentLogs = await DailyLog.find({
      userId,
      habitId: { $in: activeHabitIds },
      date: { $gte: oneWeekAgo.toJSDate() }
    }).sort({ date: -1 });

    const completedInWeek = recentLogs.filter(log => log.completed).length;
    const totalPossibleInWeek = habits.length * 7;
    const weeklyCompletionRate = totalPossibleInWeek > 0 ? 
      Math.round((completedInWeek / totalPossibleInWeek) * 100) : 0;

    // Calculate total completed days
    const allActiveLogs = await DailyLog.find({
      userId,
      habitId: { $in: activeHabitIds }
    });
    const totalCompletedDays = allActiveLogs.filter(log => log.completed).length;

    // Check today's completions
    const today = DateTime.now().setZone('Asia/Kolkata').startOf('day');
    const todayLogs = await DailyLog.find({
      userId,
      habitId: { $in: activeHabitIds },
      date: {
        $gte: today.toJSDate(),
        $lte: today.endOf('day').toJSDate()
      }
    });
    const todayCompleted = todayLogs.filter(log => log.completed).length;

    return NextResponse.json({
      summary: {
        activeHabits: habits.length,
        weeklyCompletionRate,
        totalCompletedDays,
        todayCompleted,
        todayPossible: habits.length
      },
      activeHabits: habits.map(h => ({ 
        id: h._id, 
        name: h.habitName,
        completedToday: todayLogs.some(log => 
          log.habitId.toString() === h._id.toString() && log.completed
        )
      })),
      weeklyBreakdown: {
        completedInWeek,
        totalPossibleInWeek,
        weeklyCompletionRate
      },
      nextAchievements: {
        perfectionist: {
          needed: 100,
          current: weeklyCompletionRate,
          canUnlock: weeklyCompletionRate >= 100
        },
        firstSteps: {
          needed: 3,
          // This would need streak calculation
          description: "Need 3-day streak on any habit"
        },
        multiTasker: {
          needed: 5,
          current: habits.length,
          canUnlock: habits.length >= 5
        }
      }
    });

  } catch (error) {
    console.error('❌ Current status error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}