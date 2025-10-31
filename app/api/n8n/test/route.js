import { getN8nWorkflows } from '@/lib/n8n';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const workflows = await getN8nWorkflows();
    
    return NextResponse.json({
      message: 'Connected to n8n successfully',
      workflowCount: workflows.data?.length || 0,
      workflows: workflows.data || []
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}