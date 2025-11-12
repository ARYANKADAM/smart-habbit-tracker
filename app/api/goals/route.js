import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Goal from '@/models/Goal';
import Habit from '@/models/Habit';
import DailyLog from '@/models/DailyLog';
import { getCurrentUser } from '@/lib/auth';
import { DateTime } from 'luxon';

// GET - Fetch all goals for the user (only for active habits)
export async function GET() {
  try {
    await dbConnect();
    const userId = await getCurrentUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get all active habits first
    const activeHabits = await Habit.find({ userId, isActive: true }).select('_id');
    const activeHabitIds = activeHabits.map(h => h._id);

    // Fetch goals only for active habits
    const goals = await Goal.find({ 
      userId,
      habitId: { $in: activeHabitIds }
    }).populate('habitId', 'habitName displayName').sort({ createdAt: -1 });
    
    // Update progress for each active goal
    for (const goal of goals) {
      if (goal.status === 'active') {
        const progress = await calculateGoalProgress(goal);
        goal.currentProgress = progress;
        
        // Check if goal is completed or failed
        if (progress >= goal.targetCount) {
          goal.status = 'completed';
          goal.completedAt = new Date();
        } else if (new Date() > goal.endDate) {
          goal.status = 'failed';
        }
        
        await goal.save();
      }
    }

    return NextResponse.json({ goals }, { status: 200 });
  } catch (error) {
    console.error('Get goals error:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

// POST - Create a new goal
export async function POST(request) {
  try {
    await dbConnect();
    const userId = await getCurrentUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { habitId, targetCount, period } = await request.json();

    // Validate inputs
    if (!habitId || !targetCount || !period) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify habit belongs to user
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Calculate start and end dates
    const now = DateTime.now().setZone('Asia/Kolkata');
    const startDate = now.startOf('day').toJSDate();
    const endDate = period === 'weekly' 
      ? now.plus({ weeks: 1 }).endOf('day').toJSDate()
      : now.plus({ months: 1 }).endOf('day').toJSDate();

    // Create goal
    const goal = await Goal.create({
      userId,
      habitId,
      targetCount,
      period,
      startDate,
      endDate,
      currentProgress: 0,
      status: 'active',
    });

    const populatedGoal = await Goal.findById(goal._id).populate('habitId', 'habitName displayName');

    return NextResponse.json({ goal: populatedGoal }, { status: 201 });
  } catch (error) {
    console.error('Create goal error:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}

// Helper function to calculate goal progress
async function calculateGoalProgress(goal) {
  const logs = await DailyLog.find({
    habitId: goal.habitId,
    completed: true,
    date: { $gte: goal.startDate, $lte: goal.endDate },
  });
  
  return logs.length;
}
