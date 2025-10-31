import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { auth as firebaseAdmin } from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin (for token verification)
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request) {
  try {
    await dbConnect();

    const { idToken, email, displayName, photoURL, uid } = await request.json();

    if (!idToken || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await firebaseAdmin().verifyIdToken(idToken);
      
      // Ensure the token's UID matches
      if (decodedToken.uid !== uid) {
        throw new Error('Token UID mismatch');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new user (no password needed for Google auth)
      user = await User.create({
        email: email.toLowerCase(),
        displayName: displayName || email.split('@')[0],
        password: 'GOOGLE_AUTH_' + uid, // Placeholder password for Google users
        googleUid: uid,
        photoURL: photoURL || '',
      });
      console.log('✅ New Google user created:', email);
    } else {
      // Update existing user with Google UID if not present
      if (!user.googleUid) {
        user.googleUid = uid;
        await user.save();
      }
      console.log('✅ Existing user logged in:', email);
    }

    // Sign JWT token for your app
    const token = await signToken(user._id.toString());

    const response = NextResponse.json(
      {
        message: 'Authenticated successfully',
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
      },
      { status: 200 }
    );

    // Set auth cookie
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}