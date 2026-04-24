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

// E-08 — Team leaderboard mock. Khớp ảnh user story (4 consultants + 2 leaders).
// Gắn user_id của 2 nhân vật thật trong MOCK_PERSONS (consultant-01 = "Linh
// Nguyễn (Bạn)", leader-01 = "Hoa Lê") để FE highlight is_me theo current user.
export const MOCK_KPI_TEAM = {
  month: '2026-04',
  summary: {
    enrolled_this_month: 13,
    monthly_target: 26,
    monthly_revenue_vnd: 910_000_000,
    active_leads: 12,
    conversion_rate: 100,
  },
  members: [
    {
      user_id: 'mock-huong',
      full_name: 'Hương Nguyễn',
      role: 'consultant' as const,
      enrolled_count: 4,
      target: 5,
      revenue_vnd: 280_000_000,
      active_leads: 14,
      load_pct: 70,
      needs_support: false,
    },
    {
      user_id: 'mock-lan',
      full_name: 'Lan Phạm',
      role: 'consultant' as const,
      enrolled_count: 3,
      target: 5,
      revenue_vnd: 210_000_000,
      active_leads: 12,
      load_pct: 60,
      needs_support: false,
    },
    {
      user_id: MOCK_PERSONS[2].id, // consultant-01 → "Linh Nguyễn (Bạn)"
      full_name: 'Linh Nguyễn',
      role: 'consultant' as const,
      enrolled_count: 2,
      target: 5,
      revenue_vnd: 140_000_000,
      active_leads: 10,
      load_pct: 50,
      needs_support: false,
    },
    {
      user_id: 'mock-duc',
      full_name: 'Đức Võ',
      role: 'consultant' as const,
      enrolled_count: 1,
      target: 5,
      revenue_vnd: 70_000_000,
      active_leads: 6,
      load_pct: 30,
      needs_support: true,
    },
    {
      user_id: MOCK_PERSONS[1].id, // leader-01 → "Hoa Lê"
      full_name: 'Hoa Lê',
      role: 'leader' as const,
      enrolled_count: 2,
      target: 3,
      revenue_vnd: 140_000_000,
      active_leads: 8,
      load_pct: 40,
      needs_support: false,
    },
    {
      user_id: 'mock-minh-leader',
      full_name: 'Minh Trần',
      role: 'leader' as const,
      enrolled_count: 1,
      target: 3,
      revenue_vnd: 70_000_000,
      active_leads: 5,
      load_pct: 25,
      needs_support: true,
    },
  ],
}
