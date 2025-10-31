import dbConnect from '@/lib/mongodb';
import DailyLog from '@/models/DailyLog';
import Habit from '@/models/Habit';
import Streak from '@/models/Streaks';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const userId = await getCurrentUser();
    const { id } = params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const habit = await Habit.findOne({ _id: id, userId });
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    const streak = await Streak.findOne({ habitId: id });
    
    // Get today's date at midnight (in local timezone)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate 30 days ago
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // 30 days including today

    // Query logs
    const logs = await DailyLog.find({
      habitId: id,
      date: { $gte: thirtyDaysAgo, $lte: today }
    }).sort({ date: 1 }).lean();

    const completed = logs.filter(l => l.completed).length;
    const completionRate = logs.length > 0 ? Math.round((completed / logs.length) * 100) : 0;

    // Build chart data for last 30 days
    const chartData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      // Format date as YYYY-MM-DD for comparison
      const dateStr = date.toISOString().split('T')[0];
      
      // Find if there's a log for this date
      const log = logs.find(l => {
        const logDateStr = new Date(l.date).toISOString().split('T')[0];
        return logDateStr === dateStr;
      });
      
      chartData.push({
        date: date.toISOString(), // Send as ISO string, frontend will format
        completed: log?.completed ? 1 : 0,
      });
    }

    return NextResponse.json(
      {
        habit,
        streak: streak || { currentStreak: 0, longestStreak: 0 },
        completionRate,
        chartData,
        totalCompleted: completed,
        totalDays: logs.length || 30
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}