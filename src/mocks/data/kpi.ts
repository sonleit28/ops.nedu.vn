// src/mocks/data/kpi.ts
import { MOCK_PERSONS } from './persons'

export const MOCK_KPI = {
  month: '2026-04',
  summary: {
    total_active_leads: 14, enrolled_this_month: 3, new_leads_last_7_days: 5,
    conversion_rate: 21.4, monthly_target: 10, monthly_revenue_vnd: 210_000_000,
  },
  consultants: [
    {
      person_id: MOCK_PERSONS[2].id, full_name: MOCK_PERSONS[2].full_name,
      enrolled_count: 2, target: 4, revenue_vnd: 140_000_000, active_leads: 14, load_pct: 70,
      badges: ['top_closer'],
    },
    {
      person_id: MOCK_PERSONS[3].id, full_name: MOCK_PERSONS[3].full_name,
      enrolled_count: 1, target: 4, revenue_vnd: 70_000_000, active_leads: 6, load_pct: 30,
      badges: ['needs_support'],
    },
  ],
}
