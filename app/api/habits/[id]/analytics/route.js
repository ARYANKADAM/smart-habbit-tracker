import dbConnect from '@/lib/mongodb';
import DailyLog from '@/models/DailyLog';
import Habit from '@/models/Habit';
import Streak from '@/models/Streaks';
import User from '@/models/User';
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

    // Get user's timezone
    const user = await User.findById(userId);
    const userTimezone = user?.timezone || 'Asia/Kolkata';

    const habit = await Habit.findOne({ _id: id, userId });
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    const streak = await Streak.findOne({ habitId: id });
    
    // Use user's actual timezone
    const today = DateTime.now().setZone(userTimezone).startOf('day');
    const thirtyDaysAgo = today.minus({ days: 29 }); // 30 days including today
    
    console.log('📊 Analytics date range:', {
      timezone: userTimezone,
      today: today.toISO(),
      thirtyDaysAgo: thirtyDaysAgo.toISO(),
      todayFormatted: today.toFormat('dd/MM'),
      thirtyDaysAgoFormatted: thirtyDaysAgo.toFormat('dd/MM')
    });

    // Query logs with extended date range to ensure we don't miss any
    const logs = await DailyLog.find({
      habitId: id,
      date: { 
        $gte: thirtyDaysAgo.toJSDate(), 
        $lte: today.endOf('day').toJSDate() // Include full day
      }
    }).sort({ date: 1 }).lean();
    
    console.log(`📊 Individual habit analytics:`, {
      habitId: id,
      habitName: habit.habitName,
      userTimezone,
      today: today.toFormat('yyyy-MM-dd'),
      logsFound: logs.length
    });

    // Log each day's data for debugging
    logs.forEach(log => {
      const logDate = DateTime.fromJSDate(log.date).setZone(userTimezone);
      console.log(`📋 Log: ${logDate.toFormat('yyyy-MM-dd')} - ${log.completed ? 'COMPLETED' : 'not completed'}`);
    });

    const completed = logs.filter(l => l.completed).length;
    const completionRate = completed > 0 ? Math.round((completed / 30) * 100) : 0; // Out of 30 days

    // Build chart data for last 30 days using consistent timezone
    const chartData = [];
    for (let i = 29; i >= 0; i--) {
      const date = today.minus({ days: i }); // Date in user's timezone
      const dateStr = date.toFormat('yyyy-MM-dd');
      
      // Find if there's a log for this date
      const log = logs.find(l => {
        const logDate = DateTime.fromJSDate(l.date).setZone(userTimezone);
        const logDateStr = logDate.toFormat('yyyy-MM-dd');
        
        // Debug matching
        if (dateStr === today.toFormat('yyyy-MM-dd')) {
          console.log(`🔍 Today (${dateStr}) matching:`, {
            logDateStr,
            logCompleted: l.completed,
            match: logDateStr === dateStr
          });
        }
        
        return logDateStr === dateStr;
      });
      
      const isCompleted = log?.completed || false;
      
      // Extra debug for today
      if (dateStr === today.toFormat('yyyy-MM-dd')) {
        console.log(`🎯 TODAY'S DATA (${dateStr}):`, {
          logFound: !!log,
          completed: isCompleted,
          logData: log
        });
      }
      
      chartData.push({
        date: date.toISO(), // Send as ISO string with timezone info
        completed: isCompleted,
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