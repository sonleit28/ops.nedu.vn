import type { PipelineAction } from '../types';

const BASE = '/api';

export async function fetchTimeline(leadId: string): Promise<PipelineAction[]> {
  const res = await fetch(`${BASE}/leads/${leadId}/timeline`);
  if (!res.ok) throw new Error('Failed to fetch timeline');
  const json = await res.json();
  return json.data;
}

export async function addAction(leadId: string, payload: {
  action_type: string;
  note_content?: string;
  from_stage?: string;
  to_stage?: string;
  regression_reason?: { code: string; label: string; custom_text: string | null };
}): Promise<PipelineAction> {
  const res = await fetch(`${BASE}/leads/${leadId}/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to add action');
  const json = await res.json();
  return json.data;
}
