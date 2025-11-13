import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET - Fetch user settings
export async function GET() {
  try {
    await dbConnect();
    const userId = await getCurrentUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return settings
    const settings = {
      displayName: user.displayName || '',
      email: user.email,
      checkInTime: user.checkInTime || '21:00',
      timezone: user.timezone || 'Asia/Kolkata',
      emailNotificationsEnabled: user.emailNotificationsEnabled ?? true,
      emailFrequency: user.emailFrequency || 'daily',
      weeklyDigestEnabled: user.weeklyDigestEnabled ?? true,
    };

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT - Update user settings
export async function PUT(request) {
  try {
    await dbConnect();
    const userId = await getCurrentUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const {
      displayName,
      email,
      currentPassword,
      newPassword,
      checkInTime,
      timezone,
      emailNotificationsEnabled,
      emailFrequency,
      weeklyDigestEnabled,
    } = body;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Handle email change
    if (email && email !== user.email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
      user.email = email.toLowerCase();
    }

    // Handle password change
    if (newPassword) {
      // Google users don't have passwords
      if (user.googleUid) {
        return NextResponse.json({ 
          error: 'Cannot change password for Google account' 
        }, { status: 400 });
      }

      // Verify current password
      if (!currentPassword) {
        return NextResponse.json({ 
          error: 'Current password is required to set a new password' 
        }, { status: 400 });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ 
          error: 'Current password is incorrect' 
        }, { status: 400 });
      }

      // Validate new password
      if (newPassword.length < 6) {
        return NextResponse.json({ 
          error: 'New password must be at least 6 characters' 
        }, { status: 400 });
      }

      // Hash and update new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    // Update other settings
    if (displayName !== undefined) user.displayName = displayName;
    if (checkInTime !== undefined) user.checkInTime = checkInTime;
    if (timezone !== undefined) user.timezone = timezone;
    if (emailNotificationsEnabled !== undefined) user.emailNotificationsEnabled = emailNotificationsEnabled;
    if (emailFrequency !== undefined) user.emailFrequency = emailFrequency;
    if (weeklyDigestEnabled !== undefined) user.weeklyDigestEnabled = weeklyDigestEnabled;

    await user.save();

    // Return updated settings (without password)
    const settings = {
      displayName: user.displayName,
      email: user.email,
      checkInTime: user.checkInTime,
      timezone: user.timezone,
      emailNotificationsEnabled: user.emailNotificationsEnabled,
      emailFrequency: user.emailFrequency,
      weeklyDigestEnabled: user.weeklyDigestEnabled,
    };

    return NextResponse.json({ 
      message: 'Settings updated successfully',
      settings 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
