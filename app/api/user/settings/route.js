import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET user settings
export async function GET() {
  try {
    await dbConnect();
    const userId = await getCurrentUser();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      settings: {
        checkInTime: user.checkInTime || '21:00',
        timezone: user.timezone || 'Asia/Kolkata',
        emailNotificationsEnabled: user.emailNotificationsEnabled ?? true,
        emailFrequency: user.emailFrequency || 'daily',
        weeklyDigestEnabled: user.weeklyDigestEnabled ?? true,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// UPDATE user settings
export async function PUT(request) {
  try {
    await dbConnect();
    const userId = await getCurrentUser();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { checkInTime, timezone, emailNotificationsEnabled, emailFrequency, weeklyDigestEnabled } = await request.json();

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update fields
    if (checkInTime) user.checkInTime = checkInTime;
    if (timezone) user.timezone = timezone;
    if (emailNotificationsEnabled !== undefined) user.emailNotificationsEnabled = emailNotificationsEnabled;
    if (emailFrequency) user.emailFrequency = emailFrequency;
    if (weeklyDigestEnabled !== undefined) user.weeklyDigestEnabled = weeklyDigestEnabled;

    await user.save();

    console.log('✅ User settings updated:', {
      userId,
      checkInTime: user.checkInTime,
      timezone: user.timezone
    });

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: {
        checkInTime: user.checkInTime,
        timezone: user.timezone,
        emailNotificationsEnabled: user.emailNotificationsEnabled,
        emailFrequency: user.emailFrequency,
        weeklyDigestEnabled: user.weeklyDigestEnabled,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}