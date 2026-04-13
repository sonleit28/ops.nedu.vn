import React, { useState } from 'react';
import type { ConsultantSummary } from '../../shared/types';

interface CoDealTabProps {
  consultants: ConsultantSummary[];
  currentUserId: string;
  onSubmit: (data: { co_consultant_id: string; primary_share_pct: number; co_share_pct: number; note: string | null }) => void;
  isLoading?: boolean;
}

export const CoDealTab: React.FC<CoDealTabProps> = ({ consultants, currentUserId, onSubmit, isLoading }) => {
  const available = consultants.filter(c => c.id !== currentUserId);
  const [coConsultantId, setCoConsultantId] = useState(available[0]?.id || '');
  const [primaryShare, setPrimaryShare] = useState(70);
  const [note, setNote] = useState('');

  const coShare = 100 - primaryShare;

  const handleSlider = (val: number) => {
    const clamped = Math.max(10, Math.min(90, val));
    setPrimaryShare(clamped);
  };

  return (
    <div className="space-y-4">
      {/* Co-consultant select */}
      <div>
        <label className="text-slate-400 text-xs font-medium block mb-2">Tư vấn viên hỗ trợ *</label>
        <select
          value={coConsultantId}
          onChange={e => setCoConsultantId(e.target.value)}
          className="w-full bg-slate-700 text-white text-sm px-3 py-2 rounded-xl border border-slate-600 focus:outline-none focus:border-indigo-500"
        >
          {available.map(c => (
            <option key={c.id} value={c.id}>{c.full_name} ({c.role})</option>
          ))}
        </select>
      </div>

      {/* Share ratio */}
      <div>
        <label className="text-slate-400 text-xs font-medium block mb-2">
          Tỷ lệ chia hoa hồng
        </label>
        <div className="flex items-center gap-4 mb-2">
          <div className="flex-1 text-center">
            <div className="text-white text-2xl font-bold">{primaryShare}%</div>
            <div className="text-slate-400 text-xs">Bạn</div>
          </div>
          <div className="text-slate-600">/</div>
          <div className="flex-1 text-center">
            <div className="text-indigo-300 text-2xl font-bold">{coShare}%</div>
            <div className="text-slate-400 text-xs">{available.find(c => c.id === coConsultantId)?.full_name || 'Hỗ trợ'}</div>
          </div>
        </div>
        <input
          type="range"
          min={10}
          max={90}
          value={primaryShare}
          onChange={e => handleSlider(Number(e.target.value))}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-slate-600 text-xs mt-1">
          <span>10%</span>
          <span>90%</span>
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="text-slate-400 text-xs font-medium block mb-1">Ghi chú (tùy chọn)</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Lý do tạo co-deal..."
          className="w-full bg-slate-700 text-white text-sm px-3 py-2 rounded-xl border border-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
          rows={3}
        />
      </div>

      <button
        onClick={() => onSubmit({ co_consultant_id: coConsultantId, primary_share_pct: primaryShare, co_share_pct: coShare, note: note || null })}
        disabled={!coConsultantId || isLoading}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
      >
        {isLoading ? 'Đang tạo...' : '🤝 Tạo Co-Deal'}
      </button>
    </div>
  );
};
