import React, { useState } from 'react';
import type { ConsultantSummary } from '../../shared/types';

interface TransferTabProps {
  consultants: ConsultantSummary[];
  currentUserId: string;
  onSubmit: (data: { target_consultant_id: string; reason: string }) => void;
  isLoading?: boolean;
}

export const TransferTab: React.FC<TransferTabProps> = ({ consultants, currentUserId, onSubmit, isLoading }) => {
  const leaders = consultants.filter(c => c.id !== currentUserId && (c.role === 'leader' || c.role === 'admin'));
  const others = consultants.filter(c => c.id !== currentUserId && c.role === 'consultant');

  const [targetId, setTargetId] = useState(leaders[0]?.id || others[0]?.id || '');
  const [reason, setReason] = useState('');

  const canSubmit = targetId && reason.trim().length >= 5;

  return (
    <div className="space-y-4">
      {/* Consultant groups */}
      <div>
        <label className="text-slate-400 text-xs font-medium block mb-2">Chuyển lead đến *</label>

        {leaders.length > 0 && (
          <div className="mb-3">
            <div className="text-slate-600 text-xs uppercase tracking-wide mb-1.5 px-1">Leader</div>
            {leaders.map(c => (
              <label key={c.id} className="flex items-center gap-3 cursor-pointer group py-1.5">
                <div
                  className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                    targetId === c.id ? 'border-amber-500 bg-amber-500' : 'border-slate-600 group-hover:border-slate-400'
                  }`}
                  onClick={() => setTargetId(c.id)}
                >
                  {targetId === c.id && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <div>
                  <span className="text-sm text-slate-300">{c.full_name}</span>
                  <span className="text-xs text-amber-500 ml-2">{c.team_name}</span>
                </div>
              </label>
            ))}
          </div>
        )}

        {others.length > 0 && (
          <div>
            <div className="text-slate-600 text-xs uppercase tracking-wide mb-1.5 px-1">Tư vấn viên</div>
            {others.map(c => (
              <label key={c.id} className="flex items-center gap-3 cursor-pointer group py-1.5">
                <div
                  className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                    targetId === c.id ? 'border-indigo-500 bg-indigo-500' : 'border-slate-600 group-hover:border-slate-400'
                  }`}
                  onClick={() => setTargetId(c.id)}
                >
                  {targetId === c.id && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <span className="text-sm text-slate-300">{c.full_name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Reason */}
      <div>
        <label className="text-slate-400 text-xs font-medium block mb-1">
          Lý do chuyển <span className="text-red-400">*</span>
          <span className="text-slate-600 ml-1">(tối thiểu 5 ký tự)</span>
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Lý do cụ thể để chuyển lead..."
          className={`w-full bg-slate-700 text-white text-sm px-3 py-2 rounded-xl border focus:outline-none resize-none transition-colors ${
            reason.trim().length > 0 && reason.trim().length < 5
              ? 'border-red-500 focus:border-red-400'
              : 'border-slate-600 focus:border-indigo-500'
          }`}
          rows={3}
        />
        {reason.trim().length > 0 && reason.trim().length < 5 && (
          <p className="text-red-400 text-xs mt-1">Cần ít nhất 5 ký tự</p>
        )}
      </div>

      <button
        onClick={() => onSubmit({ target_consultant_id: targetId, reason: reason.trim() })}
        disabled={!canSubmit || isLoading}
        className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
      >
        {isLoading ? 'Đang chuyển...' : '➡️ Chuyển Lead'}
      </button>
    </div>
  );
};
