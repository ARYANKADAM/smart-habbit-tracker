import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import StreakChallenge from '@/models/StreakChallenge';
import { getCurrentUser } from '@/lib/auth';

// DELETE - Delete a challenge
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const userId = await getCurrentUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const challenge = await StreakChallenge.findOneAndDelete({ _id: id, userId });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Challenge deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete challenge error:', error);
    return NextResponse.json({ error: 'Failed to delete challenge' }, { status: 500 });
  }
}
