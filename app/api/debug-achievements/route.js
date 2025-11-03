import dbConnect from '@/lib/mongodb';
import Achievement from '@/models/Achievement';
import User from '@/models/User';
import Habit from '@/models/Habit';
import DailyLog from '@/models/DailyLog';
import Streak from '@/models/Streaks';
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
    const habits = await Habit.find({ userId, isActive: true });
    const dailyLogs = await DailyLog.find({ userId }).sort({ date: 1 });
    const streaks = await Streak.find({ habitId: { $in: habits.map(h => h._id) } });
    const userAchievements = await Achievement.find({ userId });

    // Calculate current progress
    let maxStreak = 0;
    let comebackStreaks = 0;
    
    for (const habit of habits) {
      const streak = streaks.find(s => s.habitId.toString() === habit._id.toString());
      if (streak) {
        maxStreak = Math.max(maxStreak, streak.currentStreak, streak.longestStreak);
        // Note: comebackStreaks calculation would need more complex logic
      }
    }

    const oneWeekAgo = DateTime.now().setZone('Asia/Kolkata').minus({ days: 7 }).startOf('day');
    const recentLogs = dailyLogs.filter(log => 
      DateTime.fromJSDate(log.date).setZone('Asia/Kolkata') >= oneWeekAgo
    );
    
    const completedInWeek = recentLogs.filter(log => log.completed).length;
    const totalPossibleInWeek = habits.length * 7;
    const weeklyCompletionRate = totalPossibleInWeek > 0 ? 
      Math.round((completedInWeek / totalPossibleInWeek) * 100) : 0;
    
    const totalCompletedDays = dailyLogs.filter(log => log.completed).length;

    const userData = {
      totalHabits: habits.length,
      maxStreak,
      weeklyCompletionRate,
      totalCompletedDays,
      comebackStreaks,
      earlyBirdCount: 0, // Not implemented yet
      nightOwlCount: 0, // Not implemented yet
    };

    // Check progress toward each achievement
    const achievementProgress = Object.entries(ACHIEVEMENTS_CONFIG).map(([id, config]) => {
      const isUnlocked = userAchievements.some(a => a.achievementId === id);
      const meetsCondition = config.condition(userData);
      
      let progress = "Ready to unlock!";
      let progressPercent = 100;
      
      if (!meetsCondition) {
        // Calculate specific progress
        switch (id) {
          case 'first-streak':
            progress = `${userData.maxStreak}/3 days streak`;
            progressPercent = Math.min((userData.maxStreak / 3) * 100, 100);
            break;
          case 'week-warrior':
            progress = `${userData.maxStreak}/7 days streak`;
            progressPercent = Math.min((userData.maxStreak / 7) * 100, 100);
            break;
          case 'multi-tasker':
            progress = `${userData.totalHabits}/5 habits created`;
            progressPercent = Math.min((userData.totalHabits / 5) * 100, 100);
            break;
          case 'perfectionist':
            progress = `${userData.weeklyCompletionRate}/100% weekly completion`;
            progressPercent = userData.weeklyCompletionRate;
            break;
          case 'consistency-king':
            progress = `${userData.totalCompletedDays}/30 completed days`;
            progressPercent = Math.min((userData.totalCompletedDays / 30) * 100, 100);
            break;
          case 'streak-master':
            progress = `${userData.maxStreak}/30 days streak`;
            progressPercent = Math.min((userData.maxStreak / 30) * 100, 100);
            break;
          default:
            progress = "Not available yet";
            progressPercent = 0;
        }
      }

      return {
        id,
        title: config.title,
        points: config.points,
        isUnlocked,
        meetsCondition,
        progress,
        progressPercent: Math.round(progressPercent)
      };
    }).sort((a, b) => {
      // Sort by: unlocked first, then by points ascending
      if (a.isUnlocked !== b.isUnlocked) return a.isUnlocked ? -1 : 1;
      return a.points - b.points;
    });

    const currentPoints = userAchievements.reduce((sum, a) => sum + a.points, 0);

    return NextResponse.json({
      currentStats: userData,
      currentPoints,
      unlockedAchievements: userAchievements.length,
      achievementProgress,
      nextEasyAchievements: achievementProgress
        .filter(a => !a.isUnlocked && a.progressPercent >= 50)
        .slice(0, 3)
    });

  } catch (error) {
    console.error('❌ Achievement progress error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}