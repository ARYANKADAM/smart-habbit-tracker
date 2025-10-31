import dbConnect from '@/lib/mongodb';
import Streak from '@/models/Streaks';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const streak = await Streak.findOne({ habitId: id });

    if (!streak) {
      return NextResponse.json(
        { streak: { currentStreak: 0, longestStreak: 0 } },
        { status: 200 }
      );
    }

    return NextResponse.json({ streak }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}