import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import bcryptjs from 'bcryptjs';
import { NextResponse } from 'next/server';
import { authorizeEmailInMailgun } from '@/lib/email';

export async function POST(request) {
  try {
    await dbConnect();

    const { email, password, displayName } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      displayName: displayName || email.split('@')[0],
    });

    // Auto-authorize email in Mailgun (for sandbox domain)
    // This allows the user to receive emails without manual authorization
    try {
      await authorizeEmailInMailgun(user.email);
    } catch (error) {
      console.log('Mailgun authorization note:', error.message);
      // Don't fail signup if Mailgun authorization fails
    }

    // Sign token
    const token = await signToken(user._id.toString());

    const response = NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
        },
      },
      { status: 201 }
    );

    // Set cookie
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}