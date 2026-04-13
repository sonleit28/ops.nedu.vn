import React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { KpiSummary, LeaderboardEntry } from '../../shared/types';
import { KpiSummaryCards } from './KpiSummaryCards';
import { MonthProgressBar } from './MonthProgressBar';
import { Leaderboard } from './Leaderboard';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';

async function fetchKpi(): Promise<KpiSummary> {
  const res = await fetch('/api/kpi');
  if (!res.ok) throw new Error('Failed');
  const json = await res.json();
  return json.data;
}

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch('/api/kpi/leaderboard');
  if (!res.ok) throw new Error('Failed');
  const json = await res.json();
  return json.data;
}

interface KpiPanelProps {
  onClose: () => void;
}

export const KpiPanel: React.FC<KpiPanelProps> = ({ onClose }) => {
  const { data: kpi, isLoading: kpiLoading } = useQuery({ queryKey: ['kpi'], queryFn: fetchKpi });
  const { data: leaderboard = [], isLoading: lbLoading } = useQuery({ queryKey: ['leaderboard'], queryFn: fetchLeaderboard });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div
        className="w-full md:max-w-xl md:max-h-[90vh] h-[90vh] md:rounded-2xl rounded-t-2xl bg-slate-900 border border-slate-700 flex flex-col shadow-2xl overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">📊 KPI Dashboard</h2>
            <p className="text-slate-400 text-sm">Tháng 4/2026</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {kpiLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner text="Đang tải KPI..." />
            </div>
          ) : kpi ? (
            <>
              <KpiSummaryCards kpi={kpi} />
              <MonthProgressBar kpi={kpi} />
            </>
          ) : null}

          {lbLoading ? (
            <div className="flex justify-center py-6">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <Leaderboard entries={leaderboard} />
          )}
        </div>
      </div>
    </div>
  );
};
