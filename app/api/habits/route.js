import dbConnect from '@/lib/mongodb';
import Habit from '@/models/Habit';
import Streak from '@/models/Streaks';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    const userId = await getCurrentUser();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only return active habits
    const habits = await Habit.find({ userId, isActive: true });

    return NextResponse.json({ habits }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const userId = await getCurrentUser();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { habitName, description, color, category } = await request.json();

    if (!habitName || habitName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Habit name is required' },
        { status: 400 }
      );
    }

    const existing = await Habit.findOne({ userId, habitName });
    if (existing) {
      return NextResponse.json(
        { error: 'You already have a habit with this name' },
        { status: 400 }
      );
    }

    const habit = await Habit.create({
      userId,
      habitName,
      description: description || '',
      color: color || '#3b82f6',
      category: category || 'Other',
    });

    await Streak.create({
      habitId: habit._id,
      currentStreak: 0,
      longestStreak: 0,
    });

    // ✅ TRIGGER n8n WEBHOOK for habit creation notification
    try {
      const webhookUrl = process.env.N8N_WEBHOOK_HABIT_CREATED || 
                         'http://localhost:5678/webhook/1aca0180-733a-46de-bf6d-adc37d68b472';
      
      console.log('🔔 Triggering n8n webhook:', webhookUrl);
      
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'habit_created',
          userId: userId.toString(),
          habitId: habit._id.toString(),
          habitName: habit.habitName,
          description: habit.description,
          color: habit.color,
          category: habit.category
        })
      });

      if (webhookResponse.ok) {
        console.log('✅ n8n webhook triggered successfully');
      } else {
        console.log('⚠️ n8n webhook response:', webhookResponse.status);
      }
    } catch (webhookError) {
      console.error('❌ Webhook notification failed:', webhookError.message);
      // Non-blocking - habit is still created successfully
    }

    return NextResponse.json({ habit }, { status: 201 });
  } catch (error) {
    console.error('Habit creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create habit' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const userId = await getCurrentUser();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { habitId, habitName, description, color, category } = await request.json();

    if (!habitId) {
      return NextResponse.json({ error: 'Habit ID is required' }, { status: 400 });
    }

    const habit = await Habit.findOne({ _id: habitId, userId });

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Update fields
    if (habitName) habit.habitName = habitName;
    if (description !== undefined) habit.description = description;
    if (color) habit.color = color;
    if (category) habit.category = category;

    await habit.save();

    return NextResponse.json({ habit }, { status: 200 });
  } catch (error) {
    console.error('Habit update error:', error);
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const userId = await getCurrentUser();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { habitId } = await request.json();

    if (!habitId) {
      return NextResponse.json({ error: 'Habit ID is required' }, { status: 400 });
    }

    const habit = await Habit.findOne({ _id: habitId, userId });

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Soft delete
    habit.isActive = false;
    await habit.save();

    return NextResponse.json({ message: 'Habit deleted successfully', habit }, { status: 200 });
  } catch (error) {
    console.error('Habit delete error:', error);
    return NextResponse.json({ error: 'Failed to delete habit', details: error.message }, { status: 500 });
  }
}