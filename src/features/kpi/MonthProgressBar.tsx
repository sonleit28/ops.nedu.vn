import React from 'react';
import type { KpiSummary } from '../../shared/types';

interface MonthProgressBarProps {
  kpi: KpiSummary;
}

function formatVND(amount: number): string {
  if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)}B VND`;
  if (amount >= 1e6) return `${(amount / 1e6).toFixed(0)}M VND`;
  return amount.toLocaleString('vi-VN') + ' VND';
}

export const MonthProgressBar: React.FC<MonthProgressBarProps> = ({ kpi }) => {
  const pct = Math.min(kpi.target_progress_pct, 100);
  const barColor = pct >= 80 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-slate-300 text-sm font-medium">Tiến độ tháng {kpi.period}</span>
        <span className="text-sm font-bold" style={{ color: barColor }}>{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-slate-500 text-xs">Doanh thu tháng này</div>
          <div className="text-white font-bold text-sm">{formatVND(kpi.revenue_this_month)}</div>
        </div>
        <div>
          <div className="text-slate-500 text-xs">Mục tiêu</div>
          <div className="text-white font-bold text-sm">{formatVND(kpi.target_this_month)}</div>
        </div>
        <div>
          <div className="text-slate-500 text-xs">Đã đăng ký</div>
          <div className="text-emerald-400 font-bold text-sm">{kpi.enrolled_this_month} học viên</div>
        </div>
        <div>
          <div className="text-slate-500 text-xs">Còn thiếu</div>
          <div className="text-amber-400 font-bold text-sm">{formatVND(kpi.remaining_to_target)}</div>
        </div>
      </div>
    </div>
  );
};
