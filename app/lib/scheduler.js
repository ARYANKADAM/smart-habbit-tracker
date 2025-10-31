import cron from 'node-cron';
import { triggerN8nWorkflow } from '@/lib/n8n';

const WORKFLOW_ID = process.env.N8N_EMAIL_WORKFLOW_ID;

export function startEmailScheduler() {
  // Run every day at 9 PM
  cron.schedule('0 21 * * *', async () => {
    try {
      console.log('Triggering daily email workflow...');
      await triggerN8nWorkflow(WORKFLOW_ID);
      console.log('Daily email workflow triggered successfully');
    } catch (error) {
      console.error('Error triggering workflow:', error);
    }
  });

  console.log('Email scheduler started');
}