import React, { useState } from 'react';
import type { StageGuide as StageGuideType } from '../../shared/types';

interface StageGuideProps {
  guide: StageGuideType;
}

export const StageGuide: React.FC<StageGuideProps> = ({ guide }) => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [showScript, setShowScript] = useState(false);

  const toggleItem = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const doneCount = Object.values(checked).filter(Boolean).length;
  const total = guide.checklist_items.length;

  return (
    <div className="p-4">
      {/* Eyebrow label */}
      <div className="mb-3">
        <span
          className="text-xs font-bold tracking-widest px-2 py-1 rounded"
          style={{ color: guide.color_hex, backgroundColor: guide.color_hex + '1A' }}
        >
          {guide.eyebrow_label}
        </span>
      </div>

      {/* Title */}
      <h2 className="text-white text-xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
        {guide.title}
      </h2>

      {/* Checklist */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Checklist</span>
          <span className="text-xs" style={{ color: guide.color_hex }}>{doneCount}/{total} hoàn thành</span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-slate-700 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: total > 0 ? `${(doneCount / total) * 100}%` : '0%', backgroundColor: guide.color_hex }}
          />
        </div>
        <div className="space-y-2">
          {guide.checklist_items.sort((a, b) => a.order - b.order).map(item => (
            <label
              key={item.id}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <div
                className={`w-4 h-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                  checked[item.id] ? 'border-transparent' : 'border-slate-600 group-hover:border-slate-400'
                }`}
                style={checked[item.id] ? { backgroundColor: guide.color_hex } : {}}
                onClick={() => toggleItem(item.id)}
              >
                {checked[item.id] && <span className="text-white text-[10px]">✓</span>}
              </div>
              <span
                className={`text-sm transition-colors ${
                  checked[item.id] ? 'line-through text-slate-600' : 'text-slate-300 group-hover:text-white'
                }`}
              >
                {item.text}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Script template */}
      {guide.script_template && (
        <div className="mt-4">
          <button
            onClick={() => setShowScript(!showScript)}
            className="text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1 mb-2"
          >
            <span>{showScript ? '▼' : '▶'}</span>
            <span>Script gợi ý</span>
          </button>
          {showScript && (
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-3">
              <p className="text-slate-300 text-sm italic leading-relaxed">{guide.script_template}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
