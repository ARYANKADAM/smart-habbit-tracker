import dbConnect from '@/lib/mongodb';
import DailyLog from '@/models/DailyLog';
import Habit from '@/models/Habit';
import Streak from '@/models/Streaks';
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

    console.log('🔍 Analytics Debug:', {
      userId,
      userTimezone,
      currentTime: DateTime.now().setZone(userTimezone).toISO()
    });

    // Use user's timezone for date calculations - Show last 30 days
    const today = DateTime.now().setZone(userTimezone).startOf('day');
    const thirtyDaysAgo = today.minus({ days: 29 });

    console.log('📅 Date range (30 days):', {
      today: today.toISO(),
      thirtyDaysAgo: thirtyDaysAgo.toISO(),
      userTimezone
    });

    const habits = await Habit.find({ userId, isActive: true });
    const activeHabitIds = habits.map(h => h._id.toString());
    
    // Only get logs for currently active habits
    const logs = await DailyLog.find({
      userId,
      habitId: { $in: habits.map(h => h._id) }, // Only active habits
      date: { 
        $gte: thirtyDaysAgo.toJSDate(), 
        $lte: today.endOf('day').toJSDate() // Include full day
      }
    });

    console.log('📊 Found logs:', logs.length, 'for', habits.length, 'active habits');
    console.log('🔍 Active habit IDs:', activeHabitIds);

    const streaks = await Streak.find({
      habitId: { $in: habits.map(h => h._id) }
    });

    const streakMap = {};
    streaks.forEach(s => {
      streakMap[s.habitId.toString()] = s;
    });

    // Daily stats - last 30 days
    const dailyStats = {};
    for (let i = 0; i < 30; i++) {
      const date = thirtyDaysAgo.plus({ days: i });
      const dateStr = date.toFormat('yyyy-MM-dd');
      
      // Find logs for this specific date (only for active habits)
      const dayLogs = logs.filter(log => {
        const logDate = DateTime.fromJSDate(log.date).setZone(userTimezone).startOf('day');
        const isCorrectDate = logDate.toFormat('yyyy-MM-dd') === dateStr;
        const isActiveHabit = activeHabitIds.includes(log.habitId.toString());
        return isCorrectDate && isActiveHabit;
      });

      const completed = dayLogs.filter(log => log.completed).length;
      
      console.log(`📋 ${dateStr}:`, {
        dayLogs: dayLogs.length,
        completed,
        totalHabits: habits.length,
        percentage: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0
      });

      dailyStats[dateStr] = {
        date: dateStr,
        completedCount: completed,
        totalHabits: habits.length,
        percentage: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0
      };
    }

    // Habit stats for last 30 days
    const habitStats = habits.map(habit => {
      const habitLogs = logs.filter(log => log.habitId.toString() === habit._id.toString());
      const completed = habitLogs.filter(log => log.completed).length;
      const streak = streakMap[habit._id.toString()];

      return {
        id: habit._id,
        name: habit.habitName,
        category: habit.category,
        completed,
        total: 30,
        percentage: Math.round((completed / 30) * 100),
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0
      };
    });

    const totalPossibleCompletions = habits.length * 30;
    const totalCompletions = logs.filter(l => l.completed).length;
    const monthlyPercentage = totalPossibleCompletions > 0
      ? Math.round((totalCompletions / totalPossibleCompletions) * 100)
      : 0;

    console.log('📈 Monthly stats (30 days):', {
      totalCompletions,
      totalPossibleCompletions,
      monthlyPercentage
    });

    return NextResponse.json(
      {
        dailyStats: Object.values(dailyStats).sort((a, b) => new Date(a.date) - new Date(b.date)),
        habitStats,
        weeklyPercentage: monthlyPercentage // Now shows 30-day percentage
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Analytics API error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}