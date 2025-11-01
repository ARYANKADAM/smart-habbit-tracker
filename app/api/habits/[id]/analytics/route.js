import dbConnect from '@/lib/mongodb';
import DailyLog from '@/models/DailyLog';
import Habit from '@/models/Habit';
import Streak from '@/models/Streaks';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { DateTime } from 'luxon';

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
    
    // 🌍 FIXED: Always use Asia/Kolkata timezone for consistent behavior
    const userTimezone = 'Asia/Kolkata';
    const today = DateTime.now().setZone(userTimezone).startOf('day');
    const thirtyDaysAgo = today.minus({ days: 29 }); // 30 days including today
    
    console.log('📊 Analytics date range:', {
      timezone: userTimezone,
      today: today.toISO(),
      thirtyDaysAgo: thirtyDaysAgo.toISO(),
      todayFormatted: today.toFormat('dd/MM'),
      thirtyDaysAgoFormatted: thirtyDaysAgo.toFormat('dd/MM')
    });

    // Query logs using UTC dates (since database stores in UTC)
    const logs = await DailyLog.find({
      habitId: id,
      date: { 
        $gte: thirtyDaysAgo.toUTC().toJSDate(), 
        $lte: today.toUTC().toJSDate() 
      }
    }).sort({ date: 1 }).lean();
    
    console.log(`📊 Found ${logs.length} logs for analytics`);

    const completed = logs.filter(l => l.completed).length;
    const completionRate = logs.length > 0 ? Math.round((completed / logs.length) * 100) : 0;

    // Build chart data for last 30 days using consistent timezone
    const chartData = [];
    for (let i = 29; i >= 0; i--) {
      const date = today.minus({ days: i }); // Date in Asia/Kolkata timezone
      
      // Format date as YYYY-MM-DD for comparison
      const dateStr = date.toFormat('yyyy-MM-dd');
      
      // Find if there's a log for this date
      const log = logs.find(l => {
        const logDate = DateTime.fromJSDate(l.date, { zone: 'UTC' }).setZone(userTimezone);
        const logDateStr = logDate.toFormat('yyyy-MM-dd');
        return logDateStr === dateStr;
      });
      
      chartData.push({
        date: date.toISO(), // Send as ISO string with timezone info
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