import dbConnect from '@/lib/mongodb';
import Habit from '@/models/Habit';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const userId = await getCurrentUser();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { habitName, description, color, category } = await request.json();

    const habit = await Habit.findOneAndUpdate(
      { _id: id, userId },
      { habitName, description, color, category },
      { new: true }
    );

    if (!habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ habit }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    const userId = await getCurrentUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const habitId = params.id;
    const habit = await Habit.findOneAndDelete({ _id: habitId, userId });

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Habit deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 });
  }
}
// ✅ NEW: GET handler for marking habit as done via email button
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const action = url.searchParams.get('action'); // action=complete
    const userId = url.searchParams.get('userId');

    if (action !== 'complete') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const { id } = params;

    const habit = await Habit.findOneAndUpdate(
      { _id: id, userId },
      { $set: { completedToday: true } }, // Mark as done
      { new: true }
    );

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Habit marked as done successfully!',
      habit,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
