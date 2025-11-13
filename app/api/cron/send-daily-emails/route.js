import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Habit from '@/models/Habit';
import { sendDailyHabitReminder } from '@/lib/email';
import { DateTime } from 'luxon';

// This endpoint is triggered by Vercel Cron once daily at 9 PM IST
// vercel.json: { "path": "/api/cron/send-daily-emails", "schedule": "30 15 * * *" }
// Schedule: 30 15 * * * = 3:30 PM UTC = 9:00 PM IST
export async function GET(request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const now = DateTime.now().setZone('Asia/Kolkata');

    // Find all users who have email notifications enabled
    const users = await User.find({
      emailNotificationsEnabled: { $ne: false } // Send to all users (default true)
    });

    let emailsSent = 0;
    let errors = 0;

    for (const user of users) {
      try {
        // Get user's active habits
        const habits = await Habit.find({ 
          userId: user._id, 
          isActive: true 
        }).lean();

        if (habits.length === 0) {
          continue; // Skip if no habits
        }

        // Send email
        await sendDailyHabitReminder(user, habits);
        emailsSent++;
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Daily reminders sent at 9 PM IST',
      usersChecked: users.length,
      emailsSent,
      errors,
      timestamp: now.toISO()
    }, { status: 200 });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({
      error: 'Failed to send daily reminders',
      message: error.message
    }, { status: 500 });
  }
}

// Prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;