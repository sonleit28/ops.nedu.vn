import { http, HttpResponse } from 'msw';
import { MOCK_TIMELINE_ITEMS, MOCK_CONSULTANTS } from '../../constants/mock-data';
import type { PipelineAction } from '../../shared/types';

const BASE = '/api';

// In-memory timeline store per lead
const timelines: Record<string, PipelineAction[]> = {
  l3: [...MOCK_TIMELINE_ITEMS],
};

export const pipelineHandlers = [
  http.get(`${BASE}/leads/:id/timeline`, ({ params }) => {
    const leadId = params.id as string;
    const items = timelines[leadId] || [];
    // Sort newest first
    const sorted = [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return HttpResponse.json({ data: sorted, meta: { total: sorted.length, page: 1, per_page: 50, has_next: false, next_cursor: null } });
  }),

  http.post(`${BASE}/leads/:id/actions`, async ({ params, request }) => {
    const leadId = params.id as string;
    const body = await request.json() as { action_type: string; note_content?: string; from_stage?: string; to_stage?: string; regression_reason?: { code: string; label: string; custom_text: string | null } };

    const newAction: PipelineAction = {
      id: `pa-${Date.now()}`,
      lead_id: leadId,
      actor: MOCK_CONSULTANTS[0],
      action_type: body.action_type as PipelineAction['action_type'],
      action_icon: getActionIcon(body.action_type),
      action_label: getActionLabel(body.action_type),
      from_stage: body.from_stage || null,
      to_stage: body.to_stage || null,
      regression_reason: body.regression_reason || null,
      note_content: body.note_content || null,
      payload: {},
      created_at: new Date().toISOString(),
    };

    if (!timelines[leadId]) timelines[leadId] = [];
    timelines[leadId].unshift(newAction);

    return HttpResponse.json({ data: newAction });
  }),

  http.patch(`${BASE}/leads/:id/timeline/:actionId`, async ({ params, request }) => {
    const leadId = params.id as string;
    const actionId = params.actionId as string;
    const body = await request.json() as { note_content: string };

    if (timelines[leadId]) {
      const idx = timelines[leadId].findIndex(a => a.id === actionId);
      if (idx !== -1) {
        timelines[leadId][idx] = { ...timelines[leadId][idx], note_content: body.note_content };
        return HttpResponse.json({ data: timelines[leadId][idx] });
      }
    }
    return HttpResponse.json({ code: 'NOT_FOUND', message: 'Action not found', request_id: 'req-mock' }, { status: 404 });
  }),

  http.delete(`${BASE}/leads/:id/timeline/:actionId`, ({ params }) => {
    const leadId = params.id as string;
    const actionId = params.actionId as string;

    if (timelines[leadId]) {
      timelines[leadId] = timelines[leadId].filter(a => a.id !== actionId);
    }
    return HttpResponse.json({ data: { success: true } });
  }),
];

function getActionIcon(actionType: string): string {
  const icons: Record<string, string> = {
    note_added: '📝', note_edited: '✏️', note_deleted: '🗑️',
    stage_advanced: '⬆️', stage_regressed: '⬇️',
    assigned: '👤', reassigned: '🔄', transfer_initiated: '➡️',
    co_deal_created: '🤝', enrolled: '🎉',
    lead_returned: '↩️', sla_breach_detected: '⚠️',
    lead_approved: '✅', lead_blacklisted: '🚫',
  };
  return icons[actionType] || '📋';
}

function getActionLabel(actionType: string): string {
  const labels: Record<string, string> = {
    note_added: 'Đã thêm ghi chú', note_edited: 'Đã sửa ghi chú', note_deleted: 'Đã xóa ghi chú',
    stage_advanced: 'Tiến stage', stage_regressed: 'Lùi stage',
    assigned: 'Phân công tư vấn viên', reassigned: 'Chuyển tư vấn viên', transfer_initiated: 'Chuyển lead',
    co_deal_created: 'Tạo Co-Deal', enrolled: 'Đã đăng ký',
    lead_returned: 'Lead quay lại', sla_breach_detected: 'Vi phạm SLA',
    lead_approved: 'Duyệt lead', lead_blacklisted: 'Blacklist lead',
  };
  return labels[actionType] || actionType;
}
