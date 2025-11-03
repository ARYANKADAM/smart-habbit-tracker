import dbConnect from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    const userId = await getCurrentUser();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Import and run the achievement checker
    const { checkForNewAchievements } = await import('@/lib/achievementChecker');
    const newAchievements = await checkForNewAchievements(userId);

    console.log('🏆 Forced achievement check:', {
      userId,
      newAchievementsFound: newAchievements.length,
      achievements: newAchievements.map(a => ({ id: a.achievementId, title: a.title, points: a.points }))
    });

    return NextResponse.json({
      success: true,
      message: `Achievement check complete. Found ${newAchievements.length} new achievements.`,
      newAchievements: newAchievements.map(a => ({
        id: a.achievementId,
        title: a.title,
        points: a.points,
        category: a.category
      }))
    });

  } catch (error) {
    console.error('❌ Force achievement check error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}