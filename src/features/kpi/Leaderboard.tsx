import React from 'react';
import type { LeaderboardEntry, LoadStatus } from '../../shared/types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

const loadColors: Record<LoadStatus, { text: string; bg: string }> = {
  green: { text: 'text-green-400', bg: 'bg-green-500' },
  yellow: { text: 'text-amber-400', bg: 'bg-amber-500' },
  red: { text: 'text-red-400', bg: 'bg-red-500' },
};

function formatVND(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`;
  return n.toString();
}

function getInitials(name: string): string {
  return name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries }) => {
  return (
    <div>
      <h3 className="text-white text-sm font-semibold mb-3">🏆 Bảng xếp hạng tháng này</h3>
      <div className="space-y-2">
        {entries.map(entry => {
          const lc = loadColors[entry.load_status];
          const rowBg = entry.is_me
            ? 'bg-blue-900/40 border border-blue-700/50'
            : entry.needs_support
            ? 'bg-amber-900/20 border border-amber-800/30'
            : 'bg-slate-800/60 border border-slate-700/50';

          return (
            <div key={entry.consultant.id} className={`rounded-xl p-3 ${rowBg}`}>
              <div className="flex items-center gap-3 mb-2">
                {/* Rank */}
                <span className={`text-lg font-bold w-6 text-center ${entry.rank === 1 ? 'text-yellow-400' : entry.rank === 2 ? 'text-slate-300' : entry.rank === 3 ? 'text-amber-600' : 'text-slate-500'}`}>
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                </span>
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {getInitials(entry.consultant.full_name)}
                </div>
                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium truncate">{entry.consultant.full_name}</span>
                    {entry.is_me && <span className="text-blue-400 text-xs bg-blue-900/50 px-1.5 py-0.5 rounded shrink-0">Bạn</span>}
                    {entry.needs_support && <span className="text-amber-400 text-xs">⚠️</span>}
                  </div>
                  <span className="text-slate-500 text-xs">{entry.consultant.team_name}</span>
                </div>
                {/* Revenue */}
                <div className="text-right">
                  <div className="text-white text-sm font-bold">{formatVND(entry.revenue)}đ</div>
                  <div className="text-slate-500 text-xs">{entry.enrolled}/{entry.target}</div>
                </div>
              </div>

              {/* Load bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${lc.bg}`}
                    style={{ width: `${Math.min(entry.progress_pct, 100)}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${lc.text}`}>{entry.progress_pct.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
