import { triggerN8nWorkflow } from '@/lib/n8n';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { workflowId } = body;

    if (!workflowId) {
      return NextResponse.json(
        { error: 'workflowId is required' },
        { status: 400 }
      );
    }

    const result = await triggerN8nWorkflow(workflowId);

    return NextResponse.json({
      message: 'Workflow triggered successfully',
      result
    }, { status: 200 });
  } catch (error) {
    console.error('Trigger error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}