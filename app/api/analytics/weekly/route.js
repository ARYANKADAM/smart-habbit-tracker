import dbConnect from '@/lib/mongodb';
import DailyLog from '@/models/DailyLog';
import Habit from '@/models/Habit';
import Streak from '@/models/Streaks';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    const userId = await getCurrentUser();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const habits = await Habit.find({ userId, isActive: true });
    const logs = await DailyLog.find({
      userId,
      date: { $gte: sevenDaysAgo, $lte: today }
    });

    const streaks = await Streak.find({
      habitId: { $in: habits.map(h => h._id) }
    });

    const streakMap = {};
    streaks.forEach(s => {
      streakMap[s.habitId.toString()] = s;
    });

    // Daily stats
    const dailyStats = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.toISOString().split('T')[0] === dateStr;
      });

      const completed = dayLogs.filter(log => log.completed).length;
      dailyStats[dateStr] = {
        date: dateStr,
        completedCount: completed,
        totalHabits: habits.length,
        percentage: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0
      };
    }

    // Habit stats
    const habitStats = habits.map(habit => {
      const habitLogs = logs.filter(log => log.habitId.toString() === habit._id.toString());
      const completed = habitLogs.filter(log => log.completed).length;
      const streak = streakMap[habit._id.toString()];

      return {
        id: habit._id,
        name: habit.habitName,
        category: habit.category,
        completed,
        total: 7,
        percentage: Math.round((completed / 7) * 100),
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0
      };
    });

    const weeklyPercentage = habits.length > 0
      ? Math.round((logs.filter(l => l.completed).length / (habits.length * 7)) * 100)
      : 0;

    return NextResponse.json(
      {
        dailyStats: Object.values(dailyStats),
        habitStats,
        weeklyPercentage
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}