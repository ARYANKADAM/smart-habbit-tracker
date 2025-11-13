import dbConnect from '@/lib/mongodb';
import Streak from '@/models/Streaks';
import { NextResponse } from 'next/server';
import { DateTime } from 'luxon';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const streak = await Streak.findOne({ habitId: id });

    if (!streak) {
      return NextResponse.json(
        { streak: { currentStreak: 0, longestStreak: 0, isCurrentStreak: false } },
        { status: 200 }
      );
    }

    // Calculate if streak is current (completed today or yesterday)
    let isCurrentStreak = false;
    if (streak.lastCompletedDate && streak.currentStreak > 0) {
      const now = DateTime.now().setZone('Asia/Kolkata');
      const lastCompleted = DateTime.fromJSDate(streak.lastCompletedDate).setZone('Asia/Kolkata');
      const daysDiff = Math.floor(now.diff(lastCompleted, 'days').days);
      
      // Streak is current if last completed today (0 days) or yesterday (1 day)
      isCurrentStreak = daysDiff <= 1;
    }

    return NextResponse.json({ 
      streak: {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastCompletedDate: streak.lastCompletedDate,
        isCurrentStreak
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}