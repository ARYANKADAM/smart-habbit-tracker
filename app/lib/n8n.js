const N8N_BASE_URL = process.env.N8N_BASE_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

export async function getN8nWorkflows() {
  try {
    const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workflows: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get workflows error:', error);
    throw error;
  }
}

export async function triggerN8nWorkflow(workflowId, data = {}) {
  try {
    const response = await fetch(
      `${N8N_BASE_URL}/api/v1/workflows/${workflowId}/execute`,
      {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to trigger workflow: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Trigger workflow error:', error);
    throw error;
  }
}

export async function getWorkflowExecutions(workflowId) {
  try {
    const response = await fetch(
      `${N8N_BASE_URL}/api/v1/workflows/${workflowId}/executions`,
      {
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch executions: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get executions error:', error);
    throw error;
  }
}