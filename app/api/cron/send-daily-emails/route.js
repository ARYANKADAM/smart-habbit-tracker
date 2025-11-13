import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Habit from '@/models/Habit';
import { sendDailyHabitReminder } from '@/lib/email';
import { DateTime } from 'luxon';

// This endpoint is triggered by Vercel Cron
// Add to vercel.json: { "path": "/api/cron/send-daily-emails", "schedule": "*/15 * * * *" }
export async function GET(request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get current time in 15-minute intervals (e.g., "09:00", "09:15", "09:30")
    const now = DateTime.now().setZone('Asia/Kolkata');
    const currentHour = now.hour.toString().padStart(2, '0');
    const currentMinute = Math.floor(now.minute / 15) * 15;
    const currentTimeSlot = `${currentHour}:${currentMinute.toString().padStart(2, '0')}`;

    // Find users who have notifications enabled and checkInTime matches current slot
    const users = await User.find({
      emailNotificationsEnabled: true,
      checkInTime: {
        $gte: currentTimeSlot,
        $lt: DateTime.fromFormat(currentTimeSlot, 'HH:mm').plus({ minutes: 15 }).toFormat('HH:mm')
      }
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
      message: 'Daily reminders sent',
      timeSlot: currentTimeSlot,
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