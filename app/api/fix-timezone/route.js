import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Allow both GET and POST for easy browser access
export async function GET() {
  return await updateTimezone();
}

export async function POST() {
  return await updateTimezone();
}

async function updateTimezone() {
  try {
    await dbConnect();
    const userId = await getCurrentUser();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - Please make sure you are logged in' }, { status: 401 });
    }

    // Update user timezone to Asia/Kolkata
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { timezone: 'Asia/Kolkata' },
      { new: true }
    );

    console.log('✅ Updated user timezone:', {
      userId,
      oldTimezone: 'UTC',
      newTimezone: updatedUser.timezone
    });

    return NextResponse.json({
      success: true,
      message: 'Timezone updated successfully to Asia/Kolkata',
      userId: userId,
      timezone: updatedUser.timezone
    });

  } catch (error) {
    console.error('❌ Timezone update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}