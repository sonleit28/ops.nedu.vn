import type { LeadListItem, Lead } from '../types';

const BASE = '/api';

export async function fetchLeads(params?: { stage?: string; status?: string }): Promise<{ data: LeadListItem[]; meta: { total: number } }> {
  const url = new URL(`${BASE}/leads`, window.location.origin);
  if (params?.stage) url.searchParams.set('stage', params.stage);
  if (params?.status) url.searchParams.set('status', params.status);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch leads');
  return res.json();
}

export async function fetchLead(id: string): Promise<Lead> {
  const res = await fetch(`${BASE}/leads/${id}`);
  if (!res.ok) throw new Error('Failed to fetch lead');
  const json = await res.json();
  return json.data;
}

export async function updateLead(id: string, updates: Partial<Lead['person']>): Promise<Lead> {
  const res = await fetch(`${BASE}/leads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ person: updates }),
  });
  if (!res.ok) throw new Error('Failed to update lead');
  const json = await res.json();
  return json.data;
}

export async function approveLead(id: string): Promise<Lead> {
  const res = await fetch(`${BASE}/leads/${id}/approve`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to approve lead');
  const json = await res.json();
  return json.data;
}
