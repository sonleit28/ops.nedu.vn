import type { KpiSummary, LeaderboardEntry } from '../types';

const BASE = '/api';

export async function fetchKpi(period?: string): Promise<KpiSummary> {
  const url = new URL(`${BASE}/kpi`, window.location.origin);
  if (period) url.searchParams.set('period', period);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed');
  const json = await res.json();
  return json.data;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${BASE}/kpi/leaderboard`);
  if (!res.ok) throw new Error('Failed');
  const json = await res.json();
  return json.data;
}
