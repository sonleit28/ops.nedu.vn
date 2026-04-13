import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Lead } from '../../shared/types';
import { CoDealTab } from './CoDealTab';
import { TransferTab } from './TransferTab';
import { useAuthStore } from '../auth/useAuthStore';
import { useToast } from '../../shared/components/Toast';
import { MOCK_CONSULTANTS } from '../../constants/mock-data';

type Tab = 'codeal' | 'transfer';

interface CoDealTransferModalProps {
  lead: Lead;
  onClose: () => void;
}

export const CoDealTransferModal: React.FC<CoDealTransferModalProps> = ({ lead, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('codeal');
  const toast = useToast();
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);

  // In real app, fetch from /api/consultants
  const consultants = MOCK_CONSULTANTS;

  const coDealMutation = useMutation({
    mutationFn: async (data: { co_consultant_id: string; primary_share_pct: number; co_share_pct: number; note: string | null }) => {
      const res = await fetch(`/api/leads/${lead.id}/co-deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', lead.id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Đã tạo Co-Deal thành công');
      onClose();
    },
    onError: () => toast.error('Có lỗi xảy ra'),
  });

  const transferMutation = useMutation({
    mutationFn: async (data: { target_consultant_id: string; reason: string }) => {
      const res = await fetch(`/api/leads/${lead.id}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', lead.id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Đã chuyển lead thành công');
      onClose();
    },
    onError: () => toast.error('Có lỗi xảy ra'),
  });

  const tabs = [
    { id: 'codeal' as Tab, label: '🤝 Co-Deal', desc: 'Hợp tác chia hoa hồng' },
    { id: 'transfer' as Tab, label: '➡️ Chuyển Lead', desc: 'Chuyển cho TV khác' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-700">
          <h3 className="text-white font-bold">Phân bổ Lead</h3>
          <p className="text-slate-400 text-sm mt-0.5">{lead.person.full_name}</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-900/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="px-5 py-5">
          {activeTab === 'codeal' ? (
            <CoDealTab
              consultants={consultants}
              currentUserId={user?.id || ''}
              onSubmit={(data) => coDealMutation.mutate(data)}
              isLoading={coDealMutation.isPending}
            />
          ) : (
            <TransferTab
              consultants={consultants}
              currentUserId={user?.id || ''}
              onSubmit={(data) => transferMutation.mutate(data)}
              isLoading={transferMutation.isPending}
            />
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm py-2 rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
