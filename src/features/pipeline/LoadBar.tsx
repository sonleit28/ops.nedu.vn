import React from 'react';

interface LoadBarProps {
  active: number;
  capacity?: number;
}

export const LoadBar: React.FC<LoadBarProps> = ({ active, capacity = 20 }) => {
  const pct = Math.min((active / capacity) * 100, 100);
  const color = pct < 70 ? '#22C55E' : pct < 90 ? '#F59E0B' : '#EF4444';
  const label = pct < 70 ? 'Tốt' : pct < 90 ? 'Cao' : 'Quá tải';

  return (
    <div className="px-3 py-2 bg-slate-900 border-b border-slate-700">
      <div className="flex items-center justify-between mb-1">
        <span className="text-slate-400 text-xs">Tải công việc</span>
        <span className="text-xs font-medium" style={{ color }}>
          {active}/{capacity} · {label}
        </span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};
