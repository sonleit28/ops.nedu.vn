import { useQuery } from '@tanstack/react-query';
import { fetchTimeline } from '../services/pipeline.service';

export function useTimeline(leadId: string | null) {
  return useQuery({
    queryKey: ['timeline', leadId],
    queryFn: () => fetchTimeline(leadId!),
    enabled: !!leadId,
    staleTime: 10_000,
  });
}
