import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    
    // Try to create a test user
    const testUser = await User.findOne({ email: 'test@example.com' });
    
    return NextResponse.json({
      status: 'success',
      message: '✅ Database connection working',
      testUser: testUser ? 'Test user exists' : 'No test user',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: '❌ Database connection failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}