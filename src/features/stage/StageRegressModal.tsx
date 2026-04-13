import React, { useState } from 'react';
import type { RegressionReason } from '../../shared/types';
import { MOCK_REGRESSION_REASONS } from '../../constants/mock-data';

interface StageRegressModalProps {
  onConfirm: (reason: { code: string; label: string; custom_text: string | null }) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const StageRegressModal: React.FC<StageRegressModalProps> = ({ onConfirm, onClose, isLoading }) => {
  const [selectedReason, setSelectedReason] = useState<RegressionReason | null>(null);
  const [customText, setCustomText] = useState('');

  const canConfirm = selectedReason && (!selectedReason.is_custom || customText.trim().length >= 3);

  const handleConfirm = () => {
    if (!selectedReason) return;
    onConfirm({
      code: selectedReason.code,
      label: selectedReason.label,
      custom_text: selectedReason.is_custom ? customText.trim() : null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-700">
          <h3 className="text-white font-semibold">⬇️ Lùi Stage</h3>
          <p className="text-slate-400 text-sm mt-1">Vui lòng chọn lý do lùi stage</p>
        </div>

        <div className="px-5 py-4">
          <div className="space-y-2">
            {MOCK_REGRESSION_REASONS.map(reason => (
              <label key={reason.id} className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                    selectedReason?.id === reason.id
                      ? 'border-amber-500 bg-amber-500'
                      : 'border-slate-600 group-hover:border-slate-400'
                  }`}
                  onClick={() => setSelectedReason(reason)}
                >
                  {selectedReason?.id === reason.id && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <span className={`text-sm transition-colors ${selectedReason?.id === reason.id ? 'text-white' : 'text-slate-300'}`}>
                  {reason.label}
                </span>
              </label>
            ))}
          </div>

          {/* Custom text area */}
          {selectedReason?.is_custom && (
            <div className="mt-4">
              <textarea
                placeholder="Mô tả lý do cụ thể (bắt buộc)..."
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                className="w-full bg-slate-700 text-white text-sm px-3 py-2 rounded-xl border border-slate-600 focus:outline-none focus:border-amber-500 placeholder-slate-500 resize-none"
                rows={3}
              />
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium py-2 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
            className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-xl transition-colors"
          >
            {isLoading ? 'Đang xử lý...' : 'Xác nhận lùi stage'}
          </button>
        </div>
      </div>
    </div>
  );
};
