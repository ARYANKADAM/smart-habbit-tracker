import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Habit from '@/models/Habit';
import DailyLog from '@/models/DailyLog';
import { getCurrentUser } from '@/lib/auth';
import { DateTime } from 'luxon';

export async function GET() {
  try {
    await dbConnect();
    const userId = await getCurrentUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const timezone = 'Asia/Kolkata';
    const now = DateTime.now().setZone(timezone);

    // Get active habits only
    const habits = await Habit.find({ userId, isActive: true });
    const habitIds = habits.map(h => h._id);

    // Get logs for the last 90 days
    const startDate = now.minus({ days: 90 }).startOf('day').toJSDate();
    const logs = await DailyLog.find({
      userId,
      habitId: { $in: habitIds },
      date: { $gte: startDate }
    });

    // Calculate statistics
    const stats = {
      overview: calculateOverview(habits, logs, now),
      habitTrends: calculateHabitTrends(habits, logs, now),
      bestWorstDays: calculateBestWorstDays(logs, habits.length, now),
      monthlyComparison: calculateMonthlyComparison(logs, habits.length, now),
      completionPatterns: calculateCompletionPatterns(logs, now),
      streakStats: calculateStreakStats(habits, logs),
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error('Statistics error:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}

function calculateOverview(habits, logs, now) {
  const completedLogs = logs.filter(log => log.completed);
  const totalPossible = habits.length * 90;
  const completionRate = totalPossible > 0 ? Math.round((completedLogs.length / totalPossible) * 100) : 0;

  // This week
  const weekStart = now.startOf('week').toJSDate();
  const weekLogs = logs.filter(log => log.date >= weekStart && log.completed);
  const weekPossible = habits.length * 7;
  const weekCompletionRate = weekPossible > 0 ? Math.round((weekLogs.length / weekPossible) * 100) : 0;

  // This month
  const monthStart = now.startOf('month').toJSDate();
  const monthLogs = logs.filter(log => log.date >= monthStart && log.completed);
  const daysInMonth = now.daysInMonth;
  const monthPossible = habits.length * daysInMonth;
  const monthCompletionRate = monthPossible > 0 ? Math.round((monthLogs.length / monthPossible) * 100) : 0;

  return {
    totalHabits: habits.length,
    overallCompletionRate: completionRate,
    weekCompletionRate,
    monthCompletionRate,
    totalCompletions: completedLogs.length,
  };
}

function calculateHabitTrends(habits, logs, now) {
  return habits.map(habit => {
    const habitLogs = logs.filter(log => 
      log.habitId.toString() === habit._id.toString() && log.completed
    );

    // Last 30 days trend
    const last30Days = now.minus({ days: 30 }).toJSDate();
    const recent = habitLogs.filter(log => log.date >= last30Days).length;
    const completionRate = Math.round((recent / 30) * 100);

    return {
      habitId: habit._id,
      habitName: habit.displayName || habit.habitName,
      totalCompletions: habitLogs.length,
      last30DaysCompletions: recent,
      completionRate,
    };
  });
}

function calculateBestWorstDays(logs, habitCount, now) {
  const dayStats = {};
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  logs.forEach(log => {
    if (!log.completed) return;
    const day = DateTime.fromJSDate(log.date).setZone('Asia/Kolkata').weekday % 7;
    const dayName = daysOfWeek[day];
    dayStats[dayName] = (dayStats[dayName] || 0) + 1;
  });

  const sortedDays = Object.entries(dayStats)
    .map(([day, count]) => ({ day, count, percentage: habitCount > 0 ? Math.round((count / habitCount) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);

  return {
    bestDay: sortedDays[0] || { day: 'N/A', count: 0 },
    worstDay: sortedDays[sortedDays.length - 1] || { day: 'N/A', count: 0 },
    allDays: sortedDays,
  };
}

function calculateMonthlyComparison(logs, habitCount, now) {
  const months = [];
  
  for (let i = 2; i >= 0; i--) {
    const monthDate = now.minus({ months: i });
    const monthStart = monthDate.startOf('month').toJSDate();
    const monthEnd = monthDate.endOf('month').toJSDate();
    
    const monthLogs = logs.filter(log => 
      log.completed && log.date >= monthStart && log.date <= monthEnd
    );

    const daysInMonth = monthDate.daysInMonth;
    const possible = habitCount * daysInMonth;
    const rate = possible > 0 ? Math.round((monthLogs.length / possible) * 100) : 0;

    months.push({
      month: monthDate.toFormat('MMMM yyyy'),
      completions: monthLogs.length,
      completionRate: rate,
    });
  }

  return months;
}

function calculateCompletionPatterns(logs, now) {
  const last30Days = now.minus({ days: 30 }).toJSDate();
  const recentLogs = logs.filter(log => log.date >= last30Days);

  // Group by date
  const dateGroups = {};
  recentLogs.forEach(log => {
    if (!log.completed) return;
    const dateStr = DateTime.fromJSDate(log.date).setZone('Asia/Kolkata').toISODate();
    dateGroups[dateStr] = (dateGroups[dateStr] || 0) + 1;
  });

  const dates = Object.keys(dateGroups).sort();
  
  return {
    last30Days: dates.map(date => ({
      date,
      completions: dateGroups[date],
    })),
  };
}

function calculateStreakStats(habits, logs) {
  let maxStreak = 0;
  let totalStreaks = 0;

  habits.forEach(habit => {
    const habitLogs = logs
      .filter(log => log.habitId.toString() === habit._id.toString() && log.completed)
      .sort((a, b) => a.date - b.date);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 0; i < habitLogs.length; i++) {
      if (i > 0) {
        const prevDate = DateTime.fromJSDate(habitLogs[i - 1].date);
        const currDate = DateTime.fromJSDate(habitLogs[i].date);
        const diff = currDate.diff(prevDate, 'days').days;

        if (diff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);
    maxStreak = Math.max(maxStreak, longestStreak);
    totalStreaks += longestStreak;
  });

  return {
    longestStreak: maxStreak,
    averageStreak: habits.length > 0 ? Math.round(totalStreaks / habits.length) : 0,
  };
}
