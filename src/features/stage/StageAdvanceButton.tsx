import React, { useState } from 'react';
import type { Stage } from '../../shared/types';
import { StageRegressModal } from './StageRegressModal';
import { MOCK_STAGE_GUIDES } from '../../constants/mock-data';

interface StageAdvanceButtonProps {
  currentStage: Stage;
  onAdvance: () => void;
  onRegress: (reason: { code: string; label: string; custom_text: string | null }) => void;
  onEnroll?: () => void;
  isLoading?: boolean;
}

export const StageAdvanceButton: React.FC<StageAdvanceButtonProps> = ({
  currentStage, onAdvance, onRegress, onEnroll, isLoading,
}) => {
  const [showRegressModal, setShowRegressModal] = useState(false);

  const guide = MOCK_STAGE_GUIDES.find(g => g.stage === currentStage);
  const isIntent = currentStage === 'intent';
  const isEnrolled = currentStage === 'enrolled' || currentStage === 'retention';

  const isFirst = currentStage === 'awareness';

  const handleAdvanceClick = () => {
    if (isIntent && onEnroll) {
      onEnroll();
    } else {
      onAdvance();
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-700">
        {/* Regress button */}
        {!isFirst && (
          <button
            onClick={() => setShowRegressModal(true)}
            disabled={isLoading || isEnrolled}
            className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-300 text-sm font-medium px-3 py-2 rounded-xl transition-colors"
          >
            <span>⬇️</span>
            <span className="hidden sm:inline">Lùi stage</span>
          </button>
        )}

        {/* Advance button */}
        <button
          onClick={handleAdvanceClick}
          disabled={isLoading || isEnrolled}
          className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-40 ${
            isIntent
              ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
              : isEnrolled
              ? 'bg-blue-900/50 text-blue-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isEnrolled ? (
            <span>✅ Đã hoàn thành</span>
          ) : (
            <span>{guide?.action_label || 'Tiến stage →'}</span>
          )}
        </button>
      </div>

      {showRegressModal && (
        <StageRegressModal
          onConfirm={(reason) => { onRegress(reason); setShowRegressModal(false); }}
          onClose={() => setShowRegressModal(false)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};
