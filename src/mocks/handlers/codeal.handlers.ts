import { http, HttpResponse } from 'msw';
import { MOCK_LEADS, MOCK_CONSULTANTS } from '../../constants/mock-data';
import type { CoDeal } from '../../shared/types';

const BASE = '/api';

export const codealHandlers = [
  http.get(`${BASE}/consultants`, () => {
    return HttpResponse.json({ data: MOCK_CONSULTANTS });
  }),

  http.post(`${BASE}/leads/:id/co-deals`, async ({ params, request }) => {
    const body = await request.json() as {
      co_consultant_id: string;
      primary_share_pct: number;
      co_share_pct: number;
      note: string | null;
    };

    const lead = MOCK_LEADS.find(l => l.id === params.id);
    if (!lead) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'Lead not found', request_id: 'req-mock' }, { status: 404 });
    }

    const coConsultant = MOCK_CONSULTANTS.find(c => c.id === body.co_consultant_id) || MOCK_CONSULTANTS[1];

    const coDeal: CoDeal = {
      id: `cd-${Date.now()}`,
      lead_id: lead.id,
      primary_consultant: lead.assigned_consultant || MOCK_CONSULTANTS[0],
      co_consultant: coConsultant,
      primary_share_pct: body.primary_share_pct,
      co_share_pct: body.co_share_pct,
      note: body.note,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    const idx = MOCK_LEADS.findIndex(l => l.id === params.id);
    if (idx !== -1) {
      MOCK_LEADS[idx] = { ...MOCK_LEADS[idx], co_deal: coDeal };
    }

    return HttpResponse.json({ data: coDeal });
  }),

  http.post(`${BASE}/leads/:id/transfer`, async ({ params, request }) => {
    const body = await request.json() as {
      target_consultant_id: string;
      reason: string;
    };

    const lead = MOCK_LEADS.find(l => l.id === params.id);
    if (!lead) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'Lead not found', request_id: 'req-mock' }, { status: 404 });
    }

    const targetConsultant = MOCK_CONSULTANTS.find(c => c.id === body.target_consultant_id) || MOCK_CONSULTANTS[1];

    const idx = MOCK_LEADS.findIndex(l => l.id === params.id);
    if (idx !== -1) {
      MOCK_LEADS[idx] = {
        ...MOCK_LEADS[idx],
        assigned_consultant: targetConsultant,
        updated_at: new Date().toISOString(),
      };
    }

    return HttpResponse.json({ data: { success: true, new_consultant: targetConsultant } });
  }),

  http.patch(`${BASE}/leads/:id/reassign`, async ({ params, request }) => {
    const body = await request.json() as { consultant_id: string };
    const newConsultant = MOCK_CONSULTANTS.find(c => c.id === body.consultant_id) || MOCK_CONSULTANTS[0];

    const idx = MOCK_LEADS.findIndex(l => l.id === params.id);
    if (idx !== -1) {
      MOCK_LEADS[idx] = { ...MOCK_LEADS[idx], assigned_consultant: newConsultant, updated_at: new Date().toISOString() };
    }

    return HttpResponse.json({ data: { success: true } });
  }),
];
