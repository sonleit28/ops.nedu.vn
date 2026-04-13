import { useQuery } from '@tanstack/react-query';
import { fetchLeads } from '../services/leads.service';

export function useLeads(params?: { stage?: string; status?: string }) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => fetchLeads(params),
    staleTime: 30_000,
  });
}
