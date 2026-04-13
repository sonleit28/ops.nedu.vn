import React, { useState } from 'react';
import type { Lead } from '../../shared/types';
import { CallScreenHeader } from './CallScreenHeader';
import { TabProfile } from './TabProfile';
import { TabPersonalProfile } from './TabPersonalProfile';
import { TabHistory } from './TabHistory';

type Tab = 'profile' | 'personal' | 'history';

interface CallScreenOverlayProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (updates: Partial<Lead['person']>) => void;
}

export const CallScreenOverlay: React.FC<CallScreenOverlayProps> = ({ lead, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Hồ sơ', icon: '👤' },
    { id: 'personal', label: 'Personal', icon: '✨' },
    { id: 'history', label: 'Lịch sử', icon: '💬' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full md:w-[400px] md:h-[88vh] h-[88vh] bg-slate-800 md:rounded-2xl rounded-t-2xl flex flex-col shadow-2xl animate-slide-up overflow-hidden border border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <CallScreenHeader lead={lead} />

        {/* Tabs */}
        <div className="flex border-b border-slate-700 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-400 border-b-2 border-indigo-500'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'profile' && <TabProfile lead={lead} onUpdate={onUpdate} />}
          {activeTab === 'personal' && <TabPersonalProfile lead={lead} />}
          {activeTab === 'history' && <TabHistory lead={lead} />}
        </div>
      </div>
    </div>
  );
};
