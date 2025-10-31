import { NextResponse } from 'next/server';

let initialized = false;

export async function GET() {
  if (!initialized) {
    // Trigger the cron setup
    await fetch('http://localhost:3000/api/cron/send-daily-emails');
    initialized = true;
  }

  return NextResponse.json({ message: 'App initialized' });
}