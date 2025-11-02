import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();

    // Find all users and show their current displayName status
    const allUsers = await User.find({}).select('email displayName');
    
    return NextResponse.json({ 
      message: `Found ${allUsers.length} users`,
      users: allUsers.map(u => ({
        email: u.email,
        displayName: u.displayName || 'NOT SET',
        hasDisplayName: !!u.displayName
      }))
    }, { status: 200 });
  } catch (error) {
    console.error('Query error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await dbConnect();

    // Find users without displayName or with empty displayName
    const usersToUpdate = await User.find({
      $or: [
        { displayName: { $exists: false } },
        { displayName: '' },
        { displayName: null }
      ]
    });

    console.log(`Found ${usersToUpdate.length} users to update`);

    // Update each user to set displayName from email
    const updatePromises = usersToUpdate.map(async (user) => {
      const displayName = user.email.split('@')[0];
      await User.findByIdAndUpdate(user._id, { displayName });
      console.log(`Updated user ${user.email} with displayName: ${displayName}`);
      return { email: user.email, newDisplayName: displayName };
    });

    const results = await Promise.all(updatePromises);

    return NextResponse.json({ 
      message: `Updated ${usersToUpdate.length} users with display names`,
      updatedUsers: results
    }, { status: 200 });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}