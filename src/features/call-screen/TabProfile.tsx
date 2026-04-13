import React, { useState, useCallback } from 'react';
import type { Lead } from '../../shared/types';
import { useToast } from '../../shared/components/Toast';

interface EditableFieldProps {
  label: string;
  value: string | null;
  type?: 'text' | 'email' | 'date' | 'time' | 'textarea';
  onSave: (val: string) => void;
  warning?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({ label, value, type = 'text', onSave, warning }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const [hovering, setHovering] = useState(false);

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') { handleSave(); return; }
    if (e.key === 'Escape') { setDraft(value || ''); setEditing(false); }
    if (e.key === 'Enter' && type === 'textarea' && !e.shiftKey) { handleSave(); }
  };

  return (
    <div
      className="border-b border-slate-700/50 py-2.5 group"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="flex items-start justify-between">
        <label className="text-slate-500 text-xs mb-1 block">{label}</label>
        {!editing && hovering && (
          <button onClick={() => setEditing(true)} className="text-slate-500 hover:text-slate-300 text-xs">
            ✏️
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          {type === 'textarea' ? (
            <textarea
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-slate-700 text-white text-sm px-3 py-2 rounded-lg border border-indigo-500 focus:outline-none resize-none"
              rows={3}
              placeholder={`Nhập ${label.toLowerCase()}...`}
            />
          ) : (
            <input
              autoFocus
              type={type}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-slate-700 text-white text-sm px-3 py-1.5 rounded-lg border border-indigo-500 focus:outline-none"
              placeholder={`Nhập ${label.toLowerCase()}...`}
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg"
            >
              Lưu
            </button>
            <button
              onClick={() => { setDraft(value || ''); setEditing(false); }}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded-lg"
            >
              Hủy
            </button>
          </div>
        </div>
      ) : (
        <div
          className="text-sm text-white cursor-text hover:text-slate-200"
          onClick={() => setEditing(true)}
        >
          {value ? (
            <span>{value}</span>
          ) : (
            <span className="text-slate-500 italic">Chưa có thông tin</span>
          )}
        </div>
      )}

      {warning && editing && (
        <p className="text-amber-400 text-xs mt-1">{warning}</p>
      )}
    </div>
  );
};

interface TabProfileProps {
  lead: Lead;
  onUpdate: (updates: Partial<Lead['person']>) => void;
}

export const TabProfile: React.FC<TabProfileProps> = ({ lead, onUpdate }) => {
  const toast = useToast();
  const [showDobBanner, setShowDobBanner] = useState(false);
  const person = lead.person;

  const handleSave = useCallback((field: keyof typeof person, value: string) => {
    const update = { [field]: value };

    // Show banner when dob/tob changes
    if (field === 'date_of_birth' || field === 'time_of_birth') {
      setShowDobBanner(true);
      setTimeout(() => setShowDobBanner(false), 5000);
    }

    const nameWords = field === 'full_name' ? value.trim().split(/\s+/) : person.full_name?.trim().split(/\s+/) || [];
    if (nameWords.length < 3 && field === 'full_name') {
      toast.info('Tên nên có ít nhất 3 chữ');
    }

    onUpdate(update);
    toast.success('Đã lưu thay đổi');
  }, [person, onUpdate, toast]);

  return (
    <div className="p-4 overflow-y-auto h-full">
      {showDobBanner && (
        <div className="bg-amber-900/50 border border-amber-700 rounded-xl px-4 py-3 mb-4 animate-fade-in">
          <p className="text-amber-300 text-sm">
            ✨ Ngày/giờ sinh đã thay đổi — Personal Profile cũ có thể không còn chính xác.
          </p>
        </div>
      )}

      <div className="space-y-0">
        <EditableField
          label="Họ và tên"
          value={person.full_name}
          onSave={v => handleSave('full_name', v)}
        />
        <EditableField
          label="Số điện thoại"
          value={person.phone}
          onSave={v => handleSave('phone', v)}
        />
        <EditableField
          label="Email"
          value={person.email}
          type="email"
          onSave={v => handleSave('email', v)}
        />
        <EditableField
          label="Ngày sinh"
          value={person.date_of_birth}
          type="date"
          onSave={v => handleSave('date_of_birth', v)}
        />
        <EditableField
          label="Giờ sinh"
          value={person.time_of_birth}
          type="time"
          onSave={v => handleSave('time_of_birth', v)}
        />
        <EditableField
          label="Nghề nghiệp"
          value={person.occupation}
          onSave={v => handleSave('occupation', v)}
        />
        <EditableField
          label="Mục tiêu"
          value={person.goals}
          type="textarea"
          onSave={v => handleSave('goals', v)}
        />
        <EditableField
          label="Nỗi đau / Khó khăn"
          value={person.pain_points}
          type="textarea"
          onSave={v => handleSave('pain_points', v)}
        />
      </div>

      {/* Quiz score */}
      {lead.quiz_score !== null && (
        <div className="mt-4 bg-indigo-900/30 border border-indigo-700/50 rounded-xl p-3">
          <span className="text-indigo-400 text-xs font-medium">📊 Điểm Quiz: </span>
          <span className="text-white text-sm font-bold">{lead.quiz_score}/100</span>
        </div>
      )}
    </div>
  );
};
