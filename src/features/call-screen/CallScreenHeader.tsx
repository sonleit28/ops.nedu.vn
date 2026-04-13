import React from 'react';
import type { Lead, Stage } from '../../shared/types';
import { SlaAlert } from '../pipeline/SlaAlert';

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

function getInitials(name: string): string {
  return name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();
}

interface CallScreenHeaderProps {
  lead: Lead;
}

export const CallScreenHeader: React.FC<CallScreenHeaderProps> = ({ lead }) => {
  const stageColor = stageColors[lead.current_stage];

  return (
    <div className="px-4 py-4 border-b border-slate-700 bg-slate-800">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
          style={{ backgroundColor: stageColor + '33', border: `2px solid ${stageColor}66` }}
        >
          <span style={{ color: stageColor }}>{getInitials(lead.person.full_name)}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="text-white text-lg font-bold">{lead.person.full_name}</h2>
            {lead.is_returning && (
              <span className="text-indigo-400 text-xs bg-indigo-900/50 px-2 py-0.5 rounded">↩ Học viên cũ</span>
            )}
          </div>

          <div className="flex items-center gap-3 mb-2">
            {/* Stage badge */}
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded"
              style={{ backgroundColor: stageColor + '22', color: stageColor }}
            >
              {stageLabels[lead.current_stage]}
            </span>
            {/* SLA */}
            <SlaAlert sla={lead.sla_status} />
          </div>

          {/* Phone */}
          {lead.person.phone && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-blink" />
              <span className="text-slate-300 text-sm font-mono">{lead.person.phone}</span>
              <a href={`tel:${lead.person.phone}`} className="text-indigo-400 hover:text-indigo-300 text-xs">
                Gọi ngay
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Profile completion bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-500 text-xs">Hồ sơ</span>
          <span className="text-xs font-medium text-slate-400">{lead.profile_completion_pct}%</span>
        </div>
        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${lead.profile_completion_pct}%`,
              backgroundColor: lead.profile_completion_pct >= 80 ? '#22C55E' : lead.profile_completion_pct >= 50 ? '#F59E0B' : '#EF4444',
            }}
          />
        </div>
      </div>

      {/* Co-deal badge */}
      {lead.co_deal && (
        <div className="mt-2 flex items-center gap-2 bg-violet-900/30 border border-violet-700/50 rounded-lg px-3 py-1.5">
          <span className="text-violet-400 text-xs">🤝 Co-deal với {lead.co_deal.co_consultant.full_name}</span>
          <span className="text-violet-500 text-xs">({lead.co_deal.primary_share_pct}% / {lead.co_deal.co_share_pct}%)</span>
        </div>
      )}
    </div>
  );
};
