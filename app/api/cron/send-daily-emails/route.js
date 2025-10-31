import cron from 'node-cron';
import { triggerN8nWorkflow } from '@/lib/n8n';
import { NextResponse } from 'next/server';

const WORKFLOW_ID = process.env.N8N_EMAIL_WORKFLOW_ID;

// Initialize cron job
let cronJobStarted = false;

export async function GET(request) {
  try {
    // Start the cron job only once
    if (!cronJobStarted) {
      cron.schedule('0 21 * * *', async () => {
        console.log('Running scheduled email workflow...');
        try {
          await triggerN8nWorkflow(WORKFLOW_ID);
          console.log('Email workflow completed');
        } catch (error) {
          console.error('Workflow error:', error);
        }
      });
      cronJobStarted = true;
      console.log('Cron job started');
    }

    return NextResponse.json({
      message: 'Cron scheduler is running',
      nextRun: 'Daily at 9 PM',
      workflowId: WORKFLOW_ID
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}