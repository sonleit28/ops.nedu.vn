import React from 'react';
import type { Stage } from '../../shared/types';

const STAGES: { key: Stage; label: string; color: string }[] = [
  { key: 'awareness', label: 'Tiếp cận', color: '#EF4444' },
  { key: 'interest', label: 'Quan tâm', color: '#F59E0B' },
  { key: 'consideration', label: 'Tư vấn', color: '#EAB308' },
  { key: 'intent', label: 'Chốt deal', color: '#22C55E' },
  { key: 'enrolled', label: 'Đăng ký', color: '#3B82F6' },
  { key: 'retention', label: 'Chăm sóc', color: '#8B5CF6' },
];

interface StageNavBarProps {
  currentStage: Stage;
  onStageClick?: (stage: Stage) => void;
}

export const StageNavBar: React.FC<StageNavBarProps> = ({ currentStage, onStageClick }) => {
  const currentIdx = STAGES.findIndex(s => s.key === currentStage);

  return (
    <div className="flex items-center gap-0 bg-slate-800/60 px-4 py-3">
      {STAGES.map((stage, idx) => {
        const isDone = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isUpcoming = idx > currentIdx;

        return (
          <React.Fragment key={stage.key}>
            {/* Stage dot + label */}
            <button
              onClick={() => onStageClick?.(stage.key)}
              className="flex flex-col items-center gap-1 group cursor-pointer"
              style={{ minWidth: 60 }}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  isCurrent ? 'scale-125 shadow-lg' : 'scale-100'
                }`}
                style={{
                  backgroundColor: isDone ? stage.color : isCurrent ? stage.color : 'transparent',
                  borderColor: isUpcoming ? '#475569' : stage.color,
                  boxShadow: isCurrent ? `0 0 8px ${stage.color}66` : undefined,
                }}
              />
              <span
                className="text-[10px] font-medium transition-colors"
                style={{
                  color: isUpcoming ? '#64748B' : isCurrent ? stage.color : '#94A3B8',
                }}
              >
                {stage.label}
              </span>
            </button>

            {/* Connector line */}
            {idx < STAGES.length - 1 && (
              <div
                className="flex-1 h-0.5 mb-5 transition-colors"
                style={{
                  backgroundColor: idx < currentIdx ? STAGES[idx].color + '66' : '#334155',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
