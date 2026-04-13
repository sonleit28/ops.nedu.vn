import React from 'react';
import type { LeadListItem, Stage } from '../../shared/types';
import { SlaAlert } from './SlaAlert';

interface LeadCardProps {
  lead: LeadListItem;
  isSelected: boolean;
  onClick: () => void;
}

const stageColors: Record<Stage, string> = {
  awareness: '#EF4444',
  interest: '#F59E0B',
  consideration: '#EAB308',
  intent: '#22C55E',
  enrolled: '#3B82F6',
  retention: '#8B5CF6',
};

const stageLabels: Record<Stage, string> = {
  awareness: 'Tiếp cận',
  interest: 'Quan tâm',
  consideration: 'Tư vấn',
  intent: 'Chốt deal',
  enrolled: 'Đã đăng ký',
  retention: 'Chăm sóc',
};

const actionColors: Record<string, string> = {
  'GỌI NGAY': 'bg-red-600 text-white',
  'TƯ VẤN': 'bg-amber-600 text-white',
  'TƯ VẤN SÂU': 'bg-yellow-600 text-white',
  'CHỐT DEAL': 'bg-green-600 text-white',
  'ONBOARD': 'bg-blue-600 text-white',
  'CHĂM SÓC': 'bg-purple-600 text-white',
};

function getInitials(name: string): string {
  return name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, isSelected, onClick }) => {
  const stageColor = stageColors[lead.current_stage] || '#6B7280';
  const actionColorClass = actionColors[lead.action_label] || 'bg-slate-600 text-white';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-3 border-b border-slate-700/50 transition-colors hover:bg-slate-700/50 ${
        isSelected ? 'bg-slate-700 border-l-2' : 'bg-transparent'
      }`}
      style={isSelected ? { borderLeftColor: stageColor } : {}}
    >
      {/* Row 1: Avatar + Name + Action badge */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: stageColor + '33', border: `1.5px solid ${stageColor}66` }}
          >
            <span style={{ color: stageColor }}>{getInitials(lead.full_name)}</span>
          </div>
          {/* Name */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-white text-sm font-medium truncate">{lead.full_name}</span>
              {lead.is_returning && (
                <span className="text-indigo-400 text-[10px] bg-indigo-900/50 px-1 py-0.5 rounded shrink-0">↩ Cũ</span>
              )}
            </div>
          </div>
        </div>
        {/* Action badge */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${actionColorClass}`}>
          {lead.action_label}
        </span>
      </div>

      {/* Row 2: Stage + SLA */}
      <div className="flex items-center gap-2 mb-1.5 ml-10">
        <span
          className="text-xs px-1.5 py-0.5 rounded font-medium"
          style={{ backgroundColor: stageColor + '22', color: stageColor }}
        >
          {stageLabels[lead.current_stage]}
        </span>
        <SlaAlert sla={lead.sla_status} compact />
        {lead.has_co_deal && (
          <span className="text-[10px] bg-violet-900/60 text-violet-300 px-1 py-0.5 rounded border border-violet-700/50">Co-deal</span>
        )}
      </div>

      {/* Row 3: Phone + Source */}
      <div className="flex items-center gap-2 ml-10">
        {lead.phone && (
          <span className="text-slate-400 text-xs">{lead.phone}</span>
        )}
        <span className="text-slate-600">·</span>
        <span className="text-slate-500 text-xs">{lead.source_label}</span>
      </div>

      {/* Profile hint */}
      {lead.profile_hint && (
        <p className="text-slate-500 text-xs ml-10 mt-1 line-clamp-1 italic">{lead.profile_hint}</p>
      )}
    </button>
  );
};
