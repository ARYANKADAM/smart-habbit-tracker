import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import StreakChallenge from '@/models/StreakChallenge';
import Habit from '@/models/Habit';
import DailyLog from '@/models/DailyLog';
import { getCurrentUser } from '@/lib/auth';
import { DateTime } from 'luxon';

// GET - Fetch all streak challenges (only for active habits)
export async function GET() {
  try {
    await dbConnect();
    const userId = await getCurrentUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get all active habits first
    const activeHabits = await Habit.find({ userId, isActive: true }).select('_id');
    const activeHabitIds = activeHabits.map(h => h._id);

    // Fetch challenges only for active habits - no updates, just return
    const challenges = await StreakChallenge.find({ 
      userId,
      habitId: { $in: activeHabitIds }
    })
      .populate('habitId', 'habitName displayName')
      .sort({ createdAt: -1 });

    return NextResponse.json({ challenges }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}

// POST - Create a new streak challenge
export async function POST(request) {
  try {
    await dbConnect();
    const userId = await getCurrentUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { habitId, targetDays, duration } = await request.json();

    // Validate inputs
    if (!habitId || !targetDays || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify habit belongs to user and is active
    const habit = await Habit.findOne({ _id: habitId, userId, isActive: true });
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found or inactive' }, { status: 404 });
    }

    // Calculate dates
    const now = DateTime.now().setZone('Asia/Kolkata');
    const startDate = now.startOf('day').toJSDate();
    const endDate = now.plus({ days: duration }).endOf('day').toJSDate();

    // Create challenge
    const challenge = await StreakChallenge.create({
      userId,
      habitId,
      targetDays,
      startDate,
      endDate,
      currentStreak: 0,
      status: 'active',
    });

    const populatedChallenge = await StreakChallenge.findById(challenge._id)
      .populate('habitId', 'habitName displayName');

    return NextResponse.json({ challenge: populatedChallenge }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
  }
}

// Helper function to update challenge progress
async function updateChallengeProgress(challenge) {
  // Import Streaks model to reuse existing streak data
  const Streaks = (await import('@/models/Streaks')).default;
  
  // Get current streak from Streaks table (single source of truth)
  const streak = await Streaks.findOne({ habitId: challenge.habitId });
  const currentStreak = streak?.currentStreak || 0;
  const lastCheckIn = streak?.lastCompletedDate || null;

  challenge.currentStreak = currentStreak;
  challenge.lastCheckInDate = lastCheckIn;

  // Update status based on current streak and dates
  if (currentStreak >= challenge.targetDays) {
    challenge.status = 'completed';
    challenge.completedAt = new Date();
  } else if (new Date() > challenge.endDate) {
    challenge.status = 'failed';
  }

  await challenge.save();
}

// Export function to update challenges after check-in
export async function updateChallengesAfterCheckIn(habitId, userId) {
  try {
    const challenges = await StreakChallenge.find({ 
      habitId, 
      userId,
      status: 'active' 
    });

    for (const challenge of challenges) {
      await updateChallengeProgress(challenge);
    }
  } catch (error) {
    // Silently fail - don't break check-in if challenge update fails
  }
}
