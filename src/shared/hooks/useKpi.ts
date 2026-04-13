import { useQuery } from '@tanstack/react-query';
import { fetchKpi, fetchLeaderboard } from '../services/kpi.service';

export function useKpi(period?: string) {
  return useQuery({
    queryKey: ['kpi', period],
    queryFn: () => fetchKpi(period),
    staleTime: 60_000,
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    staleTime: 60_000,
  });
}
