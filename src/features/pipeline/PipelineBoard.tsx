import React, { useState } from 'react';
import type { LeadListItem } from '../../shared/types';
import { LeadCard } from './LeadCard';
import { LoadBar } from './LoadBar';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { EmptyState } from '../../shared/components/EmptyState';

interface PipelineBoardProps {
  leads: LeadListItem[];
  isLoading: boolean;
  selectedLeadId: string | null;
  onSelectLead: (id: string) => void;
}

const STAGE_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'awareness', label: 'Tiếp cận' },
  { value: 'interest', label: 'Quan tâm' },
  { value: 'consideration', label: 'Tư vấn' },
  { value: 'intent', label: 'Chốt deal' },
  { value: 'enrolled', label: 'Đã đăng ký' },
  { value: 'retention', label: 'Chăm sóc' },
];

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  leads, isLoading, selectedLeadId, onSelectLead,
}) => {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  const filtered = leads.filter(lead => {
    const matchSearch = !search || lead.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.phone || '').includes(search);
    const matchStage = !stageFilter || lead.current_stage === stageFilter;
    return matchSearch && matchStage;
  });

  const urgent = filtered.filter(l => l.priority === 'urgent');
  const today = filtered.filter(l => l.priority === 'today');
  const rest = filtered.filter(l => l.priority !== 'urgent' && l.priority !== 'today');
  const activeLeads = leads.filter(l => l.status === 'active').length;

  return (
    <div className="w-[310px] bg-slate-800 border-r border-slate-700 flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="px-3 py-3 border-b border-slate-700 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white font-semibold text-sm">Pipeline</h2>
          <span className="text-slate-400 text-xs">{filtered.length} leads</span>
        </div>
        {/* Search */}
        <input
          type="text"
          placeholder="Tìm tên, số điện thoại..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-700 text-white text-sm px-3 py-1.5 rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
        />
        {/* Stage filter */}
        <select
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
          className="w-full mt-2 bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500"
        >
          {STAGE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Load bar */}
      <LoadBar active={activeLeads} capacity={20} />

      {/* Lead list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <LoadingSpinner text="Đang tải..." />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="🔍" title="Không tìm thấy" description="Thử thay đổi bộ lọc" />
        ) : (
          <>
            {/* Urgent group */}
            {urgent.length > 0 && (
              <div>
                <div className="px-3 py-1.5 bg-red-950/50 border-b border-red-900/50">
                  <span className="text-red-400 text-xs font-semibold uppercase tracking-wide">
                    🔴 Khẩn cấp ({urgent.length})
                  </span>
                </div>
                {urgent.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    isSelected={selectedLeadId === lead.id}
                    onClick={() => onSelectLead(lead.id)}
                  />
                ))}
              </div>
            )}

            {/* Today group */}
            {today.length > 0 && (
              <div>
                <div className="px-3 py-1.5 bg-amber-950/30 border-b border-amber-900/30">
                  <span className="text-amber-400 text-xs font-semibold uppercase tracking-wide">
                    🟡 Hôm nay ({today.length})
                  </span>
                </div>
                {today.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    isSelected={selectedLeadId === lead.id}
                    onClick={() => onSelectLead(lead.id)}
                  />
                ))}
              </div>
            )}

            {/* Rest */}
            {rest.length > 0 && (
              <div>
                {(urgent.length > 0 || today.length > 0) && (
                  <div className="px-3 py-1.5 bg-slate-900/30 border-b border-slate-700/50">
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
                      Tuần này ({rest.length})
                    </span>
                  </div>
                )}
                {rest.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    isSelected={selectedLeadId === lead.id}
                    onClick={() => onSelectLead(lead.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
