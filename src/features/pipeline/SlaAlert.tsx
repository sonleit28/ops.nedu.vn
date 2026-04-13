import React from 'react';
import type { SlaInfo } from '../../shared/types';

interface SlaAlertProps {
  sla: SlaInfo;
  compact?: boolean;
}

export const SlaAlert: React.FC<SlaAlertProps> = ({ sla, compact = false }) => {
  if (sla.status === 'ok') return null;

  const isBreached = sla.status === 'breached';
  const bg = isBreached ? 'bg-red-900/80 text-red-300 border-red-700' : 'bg-amber-900/80 text-amber-300 border-amber-700';
  const icon = isBreached ? '🔴' : '⚠️';
  const text = sla.badge_text || (isBreached ? `Quá hạn ${sla.hours_elapsed}h` : 'Sắp quá hạn');

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded border ${bg} ${compact ? 'text-[10px]' : ''}`}>
      <span>{icon}</span>
      <span>{text}</span>
    </span>
  );
};
