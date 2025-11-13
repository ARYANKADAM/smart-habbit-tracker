import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { authorizeEmailInMailgun } from '@/lib/email';

// Admin endpoint to authorize all existing users in Mailgun
export async function POST(request) {
  try {
    // Security check - require secret key
    const authHeader = request.headers.get('authorization');
    const secret = authHeader?.replace('Bearer ', '');
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get all active users with email notifications enabled
    const users = await User.find({
      isActive: true,
      emailNotificationsEnabled: true,
    }).select('email');

    const results = {
      total: users.length,
      authorized: 0,
      failed: 0,
      emails: [],
    };

    // Authorize each user
    for (const user of users) {
      try {
        await authorizeEmailInMailgun(user.email);
        results.authorized++;
        results.emails.push({ email: user.email, status: 'authorized' });
      } catch (error) {
        results.failed++;
        results.emails.push({ email: user.email, status: 'failed', error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.total} users`,
      results,
    });
  } catch (error) {
    console.error('Authorization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to authorize emails' },
      { status: 500 }
    );
  }
}
