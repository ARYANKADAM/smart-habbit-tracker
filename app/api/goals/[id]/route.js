import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Goal from '@/models/Goal';
import { getCurrentUser } from '@/lib/auth';

// DELETE - Delete a goal
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const userId = await getCurrentUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const goal = await Goal.findOneAndDelete({ _id: id, userId });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Goal deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete goal error:', error);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}

// PATCH - Update a goal
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const userId = await getCurrentUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const updates = await request.json();

    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true }
    ).populate('habitId', 'habitName displayName');

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({ goal }, { status: 200 });
  } catch (error) {
    console.error('Update goal error:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}
