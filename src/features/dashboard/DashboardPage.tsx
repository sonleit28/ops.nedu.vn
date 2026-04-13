import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Lead, Stage } from '../../shared/types';
import { PipelineBoard } from '../pipeline/PipelineBoard';
import { StageNavBar } from '../stage/StageNavBar';
import { StageGuide } from '../stage/StageGuide';
import { StageAdvanceButton } from '../stage/StageAdvanceButton';
import { CallScreenHeader } from '../call-screen/CallScreenHeader';
import { TabProfile } from '../call-screen/TabProfile';
import { TabPersonalProfile } from '../call-screen/TabPersonalProfile';
import { TabHistory } from '../call-screen/TabHistory';
import { EnrolledModal } from '../enrolled/EnrolledModal';
import { CoDealTransferModal } from '../co-deal/CoDealTransferModal';
import { useLeads } from '../../shared/hooks/useLeads';
import { useLeadDetail } from '../../shared/hooks/useLeadDetail';
import { MOCK_STAGE_GUIDES } from '../../constants/mock-data';
import { useToast } from '../../shared/components/Toast';
import { EmptyState } from '../../shared/components/EmptyState';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';

type RightTab = 'profile' | 'personal' | 'history';

const STAGE_ORDER: Stage[] = ['awareness', 'interest', 'consideration', 'intent', 'enrolled', 'retention'];

async function updateLead(id: string, updates: Partial<Lead['person']>): Promise<Lead> {
  const res = await fetch(`/api/leads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ person: updates }),
  });
  if (!res.ok) throw new Error('Failed');
  const json = await res.json();
  return json.data;
}

async function addStageAction(leadId: string, payload: object): Promise<void> {
  await fetch(`/api/leads/${leadId}/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export const DashboardPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<RightTab>('profile');
  const [showEnrolled, setShowEnrolled] = useState(false);
  const [showCoDeal, setShowCoDeal] = useState(false);

  const { data: leadsData, isLoading: leadsLoading } = useLeads();
  const { data: selectedLead, isLoading: leadLoading } = useLeadDetail(selectedLeadId);

  const leads = leadsData?.data || [];

  const currentGuide = selectedLead
    ? MOCK_STAGE_GUIDES.find(g => g.stage === selectedLead.current_stage)
    : null;

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Lead['person']> }) => updateLead(id, updates),
    onSuccess: (updatedLead) => {
      queryClient.setQueryData(['lead', updatedLead.id], updatedLead);
    },
  });

  const stageActionMutation = useMutation({
    mutationFn: ({ leadId, payload }: { leadId: string; payload: object }) => addStageAction(leadId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', selectedLeadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['timeline', selectedLeadId] });
    },
  });

  const handleAdvance = () => {
    if (!selectedLead) return;
    const currentIdx = STAGE_ORDER.indexOf(selectedLead.current_stage);
    const nextStage = STAGE_ORDER[currentIdx + 1];
    if (!nextStage) return;

    stageActionMutation.mutate({
      leadId: selectedLead.id,
      payload: { action_type: 'stage_advanced', from_stage: selectedLead.current_stage, to_stage: nextStage },
    });
    // Optimistic update
    queryClient.setQueryData(['lead', selectedLead.id], { ...selectedLead, current_stage: nextStage });
    toast.success(`Tiến stage: ${nextStage}`);
  };

  const handleRegress = (reason: { code: string; label: string; custom_text: string | null }) => {
    if (!selectedLead) return;
    const currentIdx = STAGE_ORDER.indexOf(selectedLead.current_stage);
    const prevStage = STAGE_ORDER[currentIdx - 1];
    if (!prevStage) return;

    stageActionMutation.mutate({
      leadId: selectedLead.id,
      payload: { action_type: 'stage_regressed', from_stage: selectedLead.current_stage, to_stage: prevStage, regression_reason: reason },
    });
    queryClient.setQueryData(['lead', selectedLead.id], { ...selectedLead, current_stage: prevStage });
    toast.info('Đã lùi stage');
  };

  const rightTabs: { id: RightTab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Hồ sơ', icon: '👤' },
    { id: 'personal', label: 'Personal', icon: '✨' },
    { id: 'history', label: 'Lịch sử', icon: '💬' },
  ];

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Panel: Pipeline */}
      <PipelineBoard
        leads={leads}
        isLoading={leadsLoading}
        selectedLeadId={selectedLeadId}
        onSelectLead={(id) => { setSelectedLeadId(id); setRightTab('profile'); }}
      />

      {/* Center Panel: Stage Guide */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
        {!selectedLeadId ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon="👆"
              title="Chọn một lead để bắt đầu"
              description="Nhấn vào lead bất kỳ trong danh sách bên trái để xem chi tiết và hướng dẫn stage"
            />
          </div>
        ) : leadLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner text="Đang tải..." />
          </div>
        ) : selectedLead ? (
          <>
            {/* Stage Nav */}
            <StageNavBar currentStage={selectedLead.current_stage} />

            {/* Lead summary strip */}
            <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/60">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-bold">{selectedLead.person.full_name}</h2>
                  <p className="text-slate-400 text-sm">{selectedLead.person.phone} · {selectedLead.source.label}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCoDeal(true)}
                    className="text-xs bg-violet-900/60 hover:bg-violet-800 text-violet-300 px-3 py-1.5 rounded-lg border border-violet-700/50 transition-colors"
                  >
                    🤝 Co-deal
                  </button>
                </div>
              </div>
            </div>

            {/* Stage Guide content */}
            <div className="flex-1 overflow-y-auto">
              {currentGuide && <StageGuide guide={currentGuide} />}
            </div>

            {/* Stage Advance Button */}
            <StageAdvanceButton
              currentStage={selectedLead.current_stage}
              onAdvance={handleAdvance}
              onRegress={handleRegress}
              onEnroll={() => setShowEnrolled(true)}
              isLoading={stageActionMutation.isPending}
            />
          </>
        ) : null}
      </div>

      {/* Right Panel: Tabs */}
      {selectedLead && (
        <div className="w-[400px] bg-slate-800 border-l border-slate-700 flex flex-col hidden lg:flex">
          {/* Header */}
          <CallScreenHeader lead={selectedLead} />

          {/* Tabs */}
          <div className="flex border-b border-slate-700 shrink-0">
            {rightTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setRightTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
                  rightTab === tab.id
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
            {rightTab === 'profile' && (
              <div className="h-full overflow-y-auto">
                <TabProfile
                  lead={selectedLead}
                  onUpdate={(updates) => updateMutation.mutate({ id: selectedLead.id, updates })}
                />
              </div>
            )}
            {rightTab === 'personal' && <TabPersonalProfile lead={selectedLead} />}
            {rightTab === 'history' && <TabHistory lead={selectedLead} />}
          </div>
        </div>
      )}

      {/* Modals */}
      {showEnrolled && selectedLead && (
        <EnrolledModal
          lead={selectedLead}
          onClose={() => setShowEnrolled(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['lead', selectedLead.id] });
          }}
        />
      )}

      {showCoDeal && selectedLead && (
        <CoDealTransferModal
          lead={selectedLead}
          onClose={() => setShowCoDeal(false)}
        />
      )}
    </div>
  );
};
