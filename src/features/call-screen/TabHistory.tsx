import React, { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Lead, PipelineAction } from '../../shared/types';
import { NoteBubble } from './NoteBubble';
import { NoteInput } from './NoteInput';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { useToast } from '../../shared/components/Toast';

async function fetchTimeline(leadId: string): Promise<PipelineAction[]> {
  const res = await fetch(`/api/leads/${leadId}/timeline`);
  if (!res.ok) throw new Error('Failed to fetch timeline');
  const json = await res.json();
  return json.data;
}

interface TabHistoryProps {
  lead: Lead;
}

export const TabHistory: React.FC<TabHistoryProps> = ({ lead }) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: timeline = [], isLoading } = useQuery({
    queryKey: ['timeline', lead.id],
    queryFn: () => fetchTimeline(lead.id),
  });

  const addNoteMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(`/api/leads/${lead.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_type: 'note_added', note_content: text }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', lead.id] });
      toast.success('Đã thêm ghi chú');
    },
  });

  const editNoteMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const res = await fetch(`/api/leads/${lead.id}/timeline/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_content: content }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', lead.id] });
      toast.success('Đã cập nhật ghi chú');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/leads/${lead.id}/timeline/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', lead.id] });
      toast.success('Đã xóa ghi chú');
    },
  });

  return (
    <div className="flex flex-col h-full">
      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner text="Đang tải..." />
          </div>
        ) : timeline.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            Chưa có hoạt động nào
          </div>
        ) : (
          <>
            {timeline.map((item) => (
              <NoteBubble
                key={item.id}
                action={item}
                onEdit={(id, content) => editNoteMutation.mutate({ id, content })}
                onDelete={(id) => deleteNoteMutation.mutate(id)}
              />
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Note input */}
      <NoteInput
        onSubmit={(text) => addNoteMutation.mutate(text)}
        isLoading={addNoteMutation.isPending}
      />
    </div>
  );
};
