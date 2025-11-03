import dbConnect from '@/lib/mongodb';
import Habit from '@/models/Habit';
import DailyLog from '@/models/DailyLog';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    const userId = await getCurrentUser();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active habit IDs
    const activeHabits = await Habit.find({ userId, isActive: true });
    const activeHabitIds = activeHabits.map(h => h._id);

    // Find logs for inactive/deleted habits
    const orphanedLogs = await DailyLog.find({
      userId,
      habitId: { $nin: activeHabitIds }
    });

    console.log('🧹 Cleanup analysis:', {
      activeHabits: activeHabits.length,
      activeHabitIds: activeHabitIds.map(id => id.toString()),
      orphanedLogsFound: orphanedLogs.length,
      orphanedHabits: [...new Set(orphanedLogs.map(log => log.habitId.toString()))]
    });

    return NextResponse.json({
      success: true,
      activeHabitsCount: activeHabits.length,
      activeHabits: activeHabits.map(h => ({ id: h._id, name: h.habitName })),
      orphanedLogsCount: orphanedLogs.length,
      orphanedHabitIds: [...new Set(orphanedLogs.map(log => log.habitId.toString()))],
      message: 'Analysis complete. Calculations now use only active habits.'
    });

  } catch (error) {
    console.error('❌ Cleanup analysis error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}