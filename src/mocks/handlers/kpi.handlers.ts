import { http, HttpResponse } from 'msw';
import { MOCK_KPI_SUMMARY, MOCK_LEADERBOARD, MOCK_CONSULTANTS } from '../../constants/mock-data';

const BASE = '/api';

export const kpiHandlers = [
  http.get(`${BASE}/kpi`, ({ request }) => {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '2026-04';
    return HttpResponse.json({ data: { ...MOCK_KPI_SUMMARY, period } });
  }),

  http.get(`${BASE}/kpi/leaderboard`, () => {
    return HttpResponse.json({ data: MOCK_LEADERBOARD });
  }),

  http.get(`${BASE}/consultants/:id/load`, ({ params }) => {
    const consultant = MOCK_CONSULTANTS.find(c => c.id === params.id);
    if (!consultant) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'Consultant not found', request_id: 'req-mock' }, { status: 404 });
    }
    const loads: Record<string, { active_leads: number; max_capacity: number; load_percentage: number; load_status: 'green' | 'yellow' | 'red' }> = {
      c1: { active_leads: 7, max_capacity: 20, load_percentage: 35, load_status: 'green' },
      c2: { active_leads: 16, max_capacity: 20, load_percentage: 80, load_status: 'yellow' },
      c3: { active_leads: 19, max_capacity: 20, load_percentage: 95, load_status: 'red' },
    };
    const load = loads[params.id as string] || loads['c1'];
    return HttpResponse.json({
      data: {
        consultant_id: consultant.id,
        full_name: consultant.full_name,
        ...load,
      },
    });
  }),
];
