import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Achievement from '@/models/Achievement';
import DailyLog from '@/models/DailyLog';
import Habit from '@/models/Habit';
import User from '@/models/User';
import { DateTime } from 'luxon';

export async function GET() {
  try {
    await dbConnect();
    
    // Get the user (assuming first user for debugging)
    const user = await User.findOne();
    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 404 });
    }

    // Get all habits (including deleted ones to understand the issue)
    const activeHabits = await Habit.find({ userId: user._id });
    const allHabits = await Habit.find({ userId: user._id }).select('_id title isDeleted');
    
    // Get ALL daily logs
    const allDailyLogs = await DailyLog.find({ userId: user._id }).sort({ date: 1 });
    
    // Count completed logs
    const totalCompletedLogs = allDailyLogs.filter(log => log.completed).length;
    
    // Get unique dates with at least one completion
    const uniqueCompletedDates = new Set();
    allDailyLogs.forEach(log => {
      if (log.completed) {
        const dateStr = DateTime.fromJSDate(log.date).setZone('Asia/Kolkata').toISODate();
        uniqueCompletedDates.add(dateStr);
      }
    });
    
    // Check for orphaned logs (logs for deleted habits)
    const activeHabitIds = activeHabits.map(h => h._id.toString());
    const orphanedLogs = allDailyLogs.filter(log => 
      !activeHabitIds.includes(log.habitId.toString())
    );
    
    const activeCompletedLogs = allDailyLogs.filter(log => 
      log.completed && activeHabitIds.includes(log.habitId.toString())
    );
    
    // Get the Consistency King achievement if unlocked
    const consistencyKing = await Achievement.findOne({ 
      userId: user._id, 
      achievementId: 'consistency-king' 
    });
    
    // Break down logs by habit
    const logsByHabit = {};
    allDailyLogs.forEach(log => {
      const habitId = log.habitId.toString();
      if (!logsByHabit[habitId]) {
        logsByHabit[habitId] = {
          completed: [],
          incomplete: [],
          total: 0
        };
      }
      logsByHabit[habitId].total++;
      if (log.completed) {
        logsByHabit[habitId].completed.push(
          DateTime.fromJSDate(log.date).setZone('Asia/Kolkata').toISODate()
        );
      } else {
        logsByHabit[habitId].incomplete.push(
          DateTime.fromJSDate(log.date).setZone('Asia/Kolkata').toISODate()
        );
      }
    });
    
    // Match habits with their logs
    const habitBreakdown = allHabits.map(habit => {
      const habitId = habit._id.toString();
      const logs = logsByHabit[habitId] || { completed: [], incomplete: [], total: 0 };
      const isActive = activeHabitIds.includes(habitId);
      
      return {
        habitId: habitId,
        title: habit.title,
        isActive: isActive,
        isDeleted: habit.isDeleted || false,
        totalLogs: logs.total,
        completedLogs: logs.completed.length,
        completedDates: logs.completed
      };
    });

    return NextResponse.json({
      user: {
        email: user.email,
        timezone: user.timezone
      },
      consistencyKingAchievement: consistencyKing ? {
        unlockedAt: consistencyKing.createdAt,
        points: consistencyKing.points
      } : 'Not unlocked',
      achievementRequirement: {
        name: 'Consistency King',
        requirement: '30 completed habit logs (any combination)',
        description: 'Complete habits for 30 days straight (any combination)'
      },
      calculationUsedByAchievementChecker: {
        method: 'totalCompletedDays = dailyLogs.filter(log => log.completed).length',
        explanation: 'Counts ALL completed daily logs, including deleted habits'
      },
      currentCounts: {
        totalCompletedLogs: totalCompletedLogs,
        uniqueCompletedDates: uniqueCompletedDates.size,
        activeHabitCompletedLogs: activeCompletedLogs.length,
        orphanedCompletedLogs: orphanedLogs.filter(l => l.completed).length
      },
      breakdown: {
        totalHabits: allHabits.length,
        activeHabits: activeHabits.length,
        deletedHabits: allHabits.length - activeHabits.length
      },
      habitDetails: habitBreakdown,
      conclusion: totalCompletedLogs >= 30 ? 
        `✅ You unlocked Consistency King because you have ${totalCompletedLogs} completed habit logs (including ${orphanedLogs.filter(l => l.completed).length} from deleted habits)` :
        `❌ You should NOT have Consistency King yet (only ${totalCompletedLogs} completed logs)`
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
