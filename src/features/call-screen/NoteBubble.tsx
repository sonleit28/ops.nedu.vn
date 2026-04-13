import React, { useState } from 'react';
import type { PipelineAction } from '../../shared/types';

interface NoteBubbleProps {
  action: PipelineAction;
  onEdit?: (id: string, newContent: string) => void;
  onDelete?: (id: string) => void;
}

export const NoteBubble: React.FC<NoteBubbleProps> = ({ action, onEdit, onDelete }) => {
  const [hovering, setHovering] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(action.note_content || '');

  const isNote = action.action_type === 'note_added' || action.action_type === 'note_edited';

  const handleSave = () => {
    if (draft.trim()) {
      onEdit?.(action.id, draft.trim());
    }
    setEditing(false);
  };

  const formatTime = (iso: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit',
    }).format(new Date(iso));
  };

  if (isNote && action.note_content) {
    return (
      <div
        className="flex flex-col items-end mb-3"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {editing ? (
          <div className="w-full max-w-[85%]">
            <textarea
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); }
                if (e.key === 'Escape') { setDraft(action.note_content || ''); setEditing(false); }
              }}
              className="w-full bg-amber-900 text-amber-100 text-sm px-3 py-2 rounded-xl border border-amber-600 focus:outline-none resize-none"
              rows={3}
            />
            <div className="flex gap-2 mt-1 justify-end">
              <button onClick={handleSave} className="text-xs bg-amber-600 text-white px-3 py-1 rounded-lg">Lưu</button>
              <button onClick={() => { setDraft(action.note_content || ''); setEditing(false); }} className="text-xs bg-slate-700 text-slate-300 px-3 py-1 rounded-lg">Hủy</button>
            </div>
          </div>
        ) : (
          <div className="relative max-w-[85%]">
            <div className="bg-amber-900/80 border border-amber-700/50 rounded-xl rounded-tr-sm px-3 py-2.5">
              <p className="text-amber-100 text-sm leading-relaxed whitespace-pre-wrap">{action.note_content}</p>
              <p className="text-amber-600 text-[10px] mt-1 text-right">{formatTime(action.created_at)}</p>
            </div>
            {hovering && (onEdit || onDelete) && (
              <div className="absolute -left-16 top-1 flex gap-1">
                {onEdit && (
                  <button
                    onClick={() => setEditing(true)}
                    className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded text-xs flex items-center justify-center"
                  >
                    ✏️
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(action.id)}
                    className="w-6 h-6 bg-slate-700 hover:bg-red-700 rounded text-xs flex items-center justify-center"
                  >
                    🗑️
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // System action
  return (
    <div className="flex items-center gap-2 mb-3 justify-center">
      <span className="text-slate-600 text-xs">──</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs">{action.action_icon}</span>
        <span className="text-slate-500 text-xs">{action.action_label}</span>
        {action.from_stage && action.to_stage && (
          <span className="text-slate-600 text-xs">{action.from_stage} → {action.to_stage}</span>
        )}
        {action.actor && (
          <span className="text-slate-600 text-xs">bởi {action.actor.full_name}</span>
        )}
      </div>
      <span className="text-slate-600 text-xs">──</span>
    </div>
  );
};
