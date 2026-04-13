import React from 'react';
import type { KpiSummary } from '../../shared/types';

interface KpiSummaryCardsProps {
  kpi: KpiSummary;
}


export const KpiSummaryCards: React.FC<KpiSummaryCardsProps> = ({ kpi }) => {
  const cards = [
    {
      label: 'Leads đang hoạt động',
      value: kpi.total_leads_active.toString(),
      icon: '👥',
      color: 'from-blue-900/60 to-blue-800/40 border-blue-700/50',
      textColor: 'text-blue-300',
    },
    {
      label: 'Đã đăng ký tháng này',
      value: kpi.enrolled_this_month.toString(),
      icon: '🎓',
      color: 'from-green-900/60 to-green-800/40 border-green-700/50',
      textColor: 'text-green-300',
    },
    {
      label: 'Leads mới 7 ngày',
      value: kpi.leads_new_7d.toString(),
      icon: '✨',
      color: 'from-indigo-900/60 to-indigo-800/40 border-indigo-700/50',
      textColor: 'text-indigo-300',
    },
    {
      label: 'Tỷ lệ chuyển đổi',
      value: `${kpi.conversion_rate_pct.toFixed(1)}%`,
      icon: '📈',
      color: 'from-amber-900/60 to-amber-800/40 border-amber-700/50',
      textColor: 'text-amber-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-gradient-to-br ${card.color} border rounded-xl p-4`}
        >
          <div className="text-2xl mb-1">{card.icon}</div>
          <div className={`text-2xl font-bold ${card.textColor}`}>{card.value}</div>
          <div className="text-slate-400 text-xs mt-0.5">{card.label}</div>
        </div>
      ))}
    </div>
  );
};
