import dbConnect from '@/lib/mongodb';
import Achievement from '@/models/Achievement';
import User from '@/models/User';
import Habit from '@/models/Habit';
import DailyLog from '@/models/DailyLog';
import { getCurrentUser } from '@/lib/auth';
import { ACHIEVEMENTS_CONFIG } from '@/lib/achievements';
import { NextResponse } from 'next/server';
import { DateTime } from 'luxon';

export async function GET() {
  try {
    await dbConnect();
    const userId = await getCurrentUser();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data
    const user = await User.findById(userId);
    const habits = await Habit.find({ userId });
    const dailyLogs = await DailyLog.find({ userId }).sort({ date: 1 });
    
    // Calculate weekly completion rate exactly as the achievement checker does
    const oneWeekAgo = DateTime.now().setZone('Asia/Kolkata').minus({ days: 7 }).startOf('day');
    const recentLogs = dailyLogs.filter(log => 
      DateTime.fromJSDate(log.date).setZone('Asia/Kolkata') >= oneWeekAgo
    );
    
    const completedInWeek = recentLogs.filter(log => log.completed).length;
    const totalPossibleInWeek = habits.length * 7;
    const weeklyCompletionRate = totalPossibleInWeek > 0 ? 
      Math.round((completedInWeek / totalPossibleInWeek) * 100) : 0;

    // Get detailed breakdown
    const recentLogsBreakdown = recentLogs.map(log => ({
      habitId: log.habitId.toString(),
      date: DateTime.fromJSDate(log.date).setZone('Asia/Kolkata').toFormat('yyyy-MM-dd'),
      completed: log.completed
    }));

    // Check perfectionist condition
    const perfectionist = ACHIEVEMENTS_CONFIG['perfectionist'];
    const meetsCondition = perfectionist.condition({ weeklyCompletionRate });

    // Check if already unlocked
    const existingAchievement = await Achievement.findOne({ 
      userId, 
      achievementId: 'perfectionist' 
    });

    return NextResponse.json({
      debug: {
        userId,
        userTimezone: user?.timezone || 'Asia/Kolkata',
        oneWeekAgo: oneWeekAgo.toISO(),
        now: DateTime.now().setZone('Asia/Kolkata').toISO(),
        totalHabits: habits.length,
        totalLogs: dailyLogs.length,
        recentLogsCount: recentLogs.length,
        completedInWeek,
        totalPossibleInWeek,
        weeklyCompletionRate,
        perfectionist: {
          meetsCondition,
          alreadyUnlocked: !!existingAchievement,
          conditionCheck: `${weeklyCompletionRate} >= 100 = ${weeklyCompletionRate >= 100}`
        }
      },
      habits: habits.map(h => ({ id: h._id, name: h.habitName })),
      recentLogsBreakdown,
      allRecentLogs: recentLogs.map(log => ({
        habitId: log.habitId.toString(),
        date: log.date.toISOString(),
        completed: log.completed
      }))
    });

  } catch (error) {
    console.error('❌ Perfectionist debug error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}