import { useQuery } from '@tanstack/react-query';
import { fetchLead } from '../services/leads.service';

export function useLeadDetail(id: string | null) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => fetchLead(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}
