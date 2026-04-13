import { http, HttpResponse } from 'msw';
import { MOCK_LEADS, MOCK_LEAD_LIST_ITEMS } from '../../constants/mock-data';
import type { Lead } from '../../shared/types';

const BASE = '/api';

// In-memory store
let leads = [...MOCK_LEADS];

export const leadsHandlers = [
  http.get(`${BASE}/leads`, ({ request }) => {
    const url = new URL(request.url);
    const stage = url.searchParams.get('stage');
    const status = url.searchParams.get('status');

    let items = MOCK_LEAD_LIST_ITEMS;
    if (stage) items = items.filter(l => l.current_stage === stage);
    if (status) items = items.filter(l => l.status === status);

    return HttpResponse.json({
      data: items,
      meta: { total: items.length, page: 1, per_page: 50, has_next: false, next_cursor: null },
    });
  }),

  http.get(`${BASE}/leads/:id`, ({ params }) => {
    const lead = leads.find(l => l.id === params.id);
    if (!lead) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'Lead not found', request_id: 'req-mock' }, { status: 404 });
    }
    return HttpResponse.json({ data: lead });
  }),

  http.patch(`${BASE}/leads/:id`, async ({ params, request }) => {
    const body = await request.json() as Partial<Lead>;
    const idx = leads.findIndex(l => l.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'Lead not found', request_id: 'req-mock' }, { status: 404 });
    }
    const updated: Lead = {
      ...leads[idx],
      person: { ...leads[idx].person, ...(body as { person?: Partial<Lead['person']> }).person },
      updated_at: new Date().toISOString(),
    };
    leads[idx] = updated;
    return HttpResponse.json({ data: updated });
  }),

  http.post(`${BASE}/leads/:id/approve`, ({ params }) => {
    const idx = leads.findIndex(l => l.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'Lead not found', request_id: 'req-mock' }, { status: 404 });
    }
    leads[idx] = { ...leads[idx], status: 'active', updated_at: new Date().toISOString() };
    return HttpResponse.json({ data: leads[idx] });
  }),
];
