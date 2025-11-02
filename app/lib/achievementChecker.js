import dbConnect from '@/lib/mongodb';
import Achievement from '@/models/Achievement';
import User from '@/models/User';
import Habit from '@/models/Habit';
import DailyLog from '@/models/DailyLog';
import { ACHIEVEMENTS_CONFIG } from '@/lib/achievements';
import { DateTime } from 'luxon';

export async function checkForNewAchievements(userId) {
  try {
    await dbConnect();
    
    const newAchievements = [];
    
    // Get user's existing achievements
    const existingAchievements = await Achievement.find({ userId });
    const existingIds = existingAchievements.map(a => a.achievementId);
    
    // Calculate user data for achievement conditions
    const userData = await calculateUserAchievementData(userId);
    
    // Check each achievement condition
    for (const [achievementId, config] of Object.entries(ACHIEVEMENTS_CONFIG)) {
      if (!existingIds.includes(achievementId)) {
        if (config.condition(userData)) {
          // Award achievement
          const achievement = await Achievement.create({
            userId,
            achievementId: config.id,
            title: config.title,
            description: config.description,
            icon: config.icon,
            category: config.category,
            points: config.points,
          });
          
          newAchievements.push(achievement);
        }
      }
    }
    
    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

async function calculateUserAchievementData(userId) {
  // Get user's habits
  const habits = await Habit.find({ userId });
  
  // Get all daily logs
  const dailyLogs = await DailyLog.find({ userId }).sort({ date: 1 });
  
  // Calculate streaks for all habits
  let maxStreak = 0;
  let comebackStreaks = 0;
  
  for (const habit of habits) {
    const habitLogs = dailyLogs.filter(log => 
      log.habitId.toString() === habit._id.toString() && log.completed
    );
    
    if (habitLogs.length > 0) {
      const streaks = calculateStreaks(habitLogs);
      maxStreak = Math.max(maxStreak, streaks.currentStreak, streaks.longestStreak);
      comebackStreaks += streaks.streakCount > 1 ? streaks.streakCount - 1 : 0;
    }
  }
  
  // Calculate weekly completion rate (last 7 days)
  const oneWeekAgo = DateTime.now().setZone('Asia/Kolkata').minus({ days: 7 }).startOf('day');
  const recentLogs = dailyLogs.filter(log => 
    DateTime.fromISO(log.date).setZone('Asia/Kolkata') >= oneWeekAgo
  );
  
  const completedInWeek = recentLogs.filter(log => log.completed).length;
  const totalPossibleInWeek = habits.length * 7;
  const weeklyCompletionRate = totalPossibleInWeek > 0 ? 
    Math.round((completedInWeek / totalPossibleInWeek) * 100) : 0;
  
  // Calculate total completed days
  const totalCompletedDays = dailyLogs.filter(log => log.completed).length;
  
  // Calculate time-based achievements (simplified)
  const earlyBirdCount = 0; // Would need time tracking in check-ins
  const nightOwlCount = 0; // Would need time tracking in check-ins
  
  return {
    totalHabits: habits.length,
    maxStreak,
    weeklyCompletionRate,
    totalCompletedDays,
    comebackStreaks,
    earlyBirdCount,
    nightOwlCount,
  };
}

function calculateStreaks(logs) {
  if (logs.length === 0) return { currentStreak: 0, longestStreak: 0, streakCount: 0 };
  
  let currentStreak = 0;
  let longestStreak = 0;
  let streakCount = 0;
  let tempStreak = 1;
  
  const today = DateTime.now().setZone('Asia/Kolkata').startOf('day');
  
  // Sort logs by date
  logs.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  for (let i = 0; i < logs.length; i++) {
    if (i > 0) {
      const prevDate = DateTime.fromISO(logs[i - 1].date).setZone('Asia/Kolkata');
      const currDate = DateTime.fromISO(logs[i].date).setZone('Asia/Kolkata');
      
      if (currDate.diff(prevDate, 'days').days === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        if (tempStreak > 1) streakCount++;
        tempStreak = 1;
      }
    }
    
    // Check if this is part of current streak (ending today or yesterday)
    const logDate = DateTime.fromISO(logs[i].date).setZone('Asia/Kolkata');
    const daysDiff = today.diff(logDate, 'days').days;
    if (daysDiff <= 1 && i === logs.length - 1) {
      currentStreak = tempStreak;
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);
  if (tempStreak > 1) streakCount++;
  
  return { currentStreak, longestStreak, streakCount };
}