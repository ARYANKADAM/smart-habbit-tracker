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

    // Fetch challenges only for active habits
    const challenges = await StreakChallenge.find({ 
      userId,
      habitId: { $in: activeHabitIds }
    })
      .populate('habitId', 'habitName displayName')
      .sort({ createdAt: -1 });
    
    // Update each active challenge
    for (const challenge of challenges) {
      if (challenge.status === 'active') {
        await updateChallengeProgress(challenge);
      }
    }

    return NextResponse.json({ challenges }, { status: 200 });
  } catch (error) {
    console.error('Get challenges error:', error);
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

    // Verify habit belongs to user
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
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
    console.error('Create challenge error:', error);
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
  }
}

// Helper function to update challenge progress
async function updateChallengeProgress(challenge) {
  const logs = await DailyLog.find({
    habitId: challenge.habitId,
    completed: true,
    date: { $gte: challenge.startDate, $lte: challenge.endDate },
  }).sort({ date: 1 });

  // Calculate current streak
  let currentStreak = 0;
  let tempStreak = 0;
  const now = DateTime.now().setZone('Asia/Kolkata').startOf('day');

  for (let i = 0; i < logs.length; i++) {
    const logDate = DateTime.fromJSDate(logs[i].date).setZone('Asia/Kolkata').startOf('day');
    
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = DateTime.fromJSDate(logs[i - 1].date).setZone('Asia/Kolkata').startOf('day');
      const diff = logDate.diff(prevDate, 'days').days;
      
      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }

    // Check if streak is current (includes today or yesterday)
    const daysSinceLog = now.diff(logDate, 'days').days;
    if (daysSinceLog <= 1) {
      currentStreak = tempStreak;
    }
  }

  challenge.currentStreak = currentStreak;
  challenge.lastCheckInDate = logs.length > 0 ? logs[logs.length - 1].date : null;

  // Update status
  if (currentStreak >= challenge.targetDays) {
    challenge.status = 'completed';
    challenge.completedAt = new Date();
  } else if (new Date() > challenge.endDate) {
    challenge.status = 'failed';
  }

  await challenge.save();
}
