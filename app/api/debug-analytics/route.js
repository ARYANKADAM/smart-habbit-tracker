import dbConnect from '@/lib/mongodb';
import DailyLog from '@/models/DailyLog';
import Habit from '@/models/Habit';
import User from '@/models/User';
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

    // Get user timezone
    const user = await User.findById(userId);
    const userTimezone = user?.timezone || 'Asia/Kolkata';

    // Today in user timezone
    const today = DateTime.now().setZone(userTimezone).startOf('day');
    const todayStr = today.toFormat('yyyy-MM-dd');

    console.log('🔍 DEBUG ANALYTICS:', {
      userId,
      userTimezone,
      today: today.toISO(),
      todayStr
    });

    // Get all habits
    const habits = await Habit.find({ userId, isActive: true });
    console.log('📝 Found habits:', habits.map(h => ({ id: h._id, name: h.habitName })));

    // Get ALL daily logs for today
    const todayLogs = await DailyLog.find({
      userId,
      date: {
        $gte: today.toJSDate(),
        $lte: today.endOf('day').toJSDate()
      }
    });

    console.log('📊 Today\'s logs:', todayLogs.map(log => ({
      habitId: log.habitId,
      date: log.date.toISOString(),
      completed: log.completed,
      logDate: DateTime.fromJSDate(log.date).setZone(userTimezone).toFormat('yyyy-MM-dd HH:mm:ss')
    })));

    // Get logs for last 3 days to compare
    const threeDaysAgo = today.minus({ days: 2 });
    const recentLogs = await DailyLog.find({
      userId,
      date: {
        $gte: threeDaysAgo.toJSDate(),
        $lte: today.endOf('day').toJSDate()
      }
    }).sort({ date: -1 });

    console.log('📋 Recent logs (last 3 days):', recentLogs.map(log => ({
      habitId: log.habitId,
      date: DateTime.fromJSDate(log.date).setZone(userTimezone).toFormat('yyyy-MM-dd'),
      completed: log.completed
    })));

    // Check what the analytics would calculate for today (only active habits)
    const activeHabitIds = habits.map(h => h._id.toString());
    const todayActiveLogsOnly = todayLogs.filter(log => activeHabitIds.includes(log.habitId.toString()));
    const todayActiveCompleted = todayActiveLogsOnly.filter(log => log.completed).length;
    const todayCorrectPercentage = habits.length > 0 ? Math.round((todayActiveCompleted / habits.length) * 100) : 0;

    return NextResponse.json({
      debug: {
        userId,
        userTimezone,
        today: todayStr,
        habitsCount: habits.length,
        todayLogsCount: todayLogs.length,
        todayCompleted: todayLogs.filter(log => log.completed).length,
        todayPercentage: habits.length > 0 ? Math.round((todayLogs.filter(log => log.completed).length / habits.length) * 100) : 0,
        // NEW: Corrected calculations
        todayActiveLogsCount: todayActiveLogsOnly.length,
        todayActiveCompleted,
        todayCorrectPercentage
      },
      habits: habits.map(h => ({ id: h._id, name: h.habitName })),
      todayLogs: todayLogs.map(log => ({
        habitId: log.habitId,
        completed: log.completed,
        date: DateTime.fromJSDate(log.date).setZone(userTimezone).toFormat('yyyy-MM-dd HH:mm:ss')
      })),
      recentLogs: recentLogs.map(log => ({
        habitId: log.habitId,
        completed: log.completed,
        date: DateTime.fromJSDate(log.date).setZone(userTimezone).toFormat('yyyy-MM-dd')
      }))
    });

  } catch (error) {
    console.error('❌ Debug API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}