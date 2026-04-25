// src/mocks/data/leads.ts
import type { Lead } from '@modules/ops/types'
import { MOCK_PERSONS } from './persons'

export let MOCK_LEADS: Lead[] = [
  {
    id: 'lead-0001-uuid-aaaa-000000000001',
    full_name: 'Lead User 01', phone: '0901000001', email: 'user01@example.com',
    stage: 'awareness', source: 'inbound', source_channel: 'nedu.vn/test',
    assigned_to_user_id: MOCK_PERSONS[2].id, assigned_to_full_name: MOCK_PERSONS[2].full_name,
    birth_date: '1995-03-15', birth_time: '08:30',
    occupation: 'Nhân viên văn phòng', goal: 'Hiểu bản thân hơn',
    main_concern: 'Chưa biết chọn khóa nào', test_score: 78,
    interested_courses: ['LCM'],
    sla_breached: true, sla_breach_hours: 27, is_returning: false,
    has_co_deal: false, profile_completion_pct: 65,
    ai_profile_consent: true,
    metadata: { temperature: 'hot' },
    created_at: '2026-04-17T06:00:00.000Z', updated_at: '2026-04-17T06:00:00.000Z',
  },
  {
    id: 'lead-0002-uuid-bbbb-000000000002',
    full_name: 'Lead User 02', phone: '0901000002', email: 'user02@example.com',
    stage: 'consideration', source: 'marketing', source_channel: 'fb-ads-T4/2026',
    assigned_to_user_id: MOCK_PERSONS[2].id, assigned_to_full_name: MOCK_PERSONS[2].full_name,
    birth_date: '1990-07-22',
    occupation: 'Quản lý cấp trung', goal: 'Nâng cao kỹ năng lãnh đạo',
    main_concern: 'Bận rộn, khó sắp xếp thời gian', test_score: 85,
    interested_courses: ['TKBT', 'COACHING'],
    sla_breached: false, is_returning: false, has_co_deal: false, profile_completion_pct: 80,
    ai_profile_consent: false,
    metadata: { temperature: 'warm' },
    created_at: '2026-04-15T09:00:00.000Z', updated_at: '2026-04-18T07:00:00.000Z',
  },
  {
    id: 'lead-0003-uuid-cccc-000000000003',
    full_name: 'Lead User 03', phone: '0901000003',
    stage: 'intent', source: 'referral', source_channel: 'alumni-K12',
    assigned_to_user_id: MOCK_PERSONS[2].id, assigned_to_full_name: MOCK_PERSONS[2].full_name,
    birth_date: '1988-11-01', birth_time: '14:00',
    occupation: 'Chủ kinh doanh nhỏ',
    interested_courses: ['LCM'],
    sla_breached: false, is_returning: true, has_co_deal: true, profile_completion_pct: 45,
    ai_profile_consent: false,
    metadata: { temperature: 'hot' },
    created_at: '2026-04-10T08:00:00.000Z', updated_at: '2026-04-18T10:00:00.000Z',
  },
  {
    id: 'lead-0004-uuid-dddd-000000000004',
    full_name: 'Lead User 04', phone: '0901000004', email: 'user04@example.com',
    stage: 'interest', source: 'inbound', source_channel: 'nedu.vn/consultation-form',
    assigned_to_user_id: MOCK_PERSONS[3].id, assigned_to_full_name: MOCK_PERSONS[3].full_name,
    birth_date: '1993-05-20', birth_time: '10:15',
    occupation: 'Kỹ sư phần mềm', goal: 'Cân bằng cuộc sống', main_concern: 'Chi phí cao',
    test_score: 70, interested_courses: ['WS-JOURNAL'],
    sla_breached: false, is_returning: false, has_co_deal: false, profile_completion_pct: 90,
    ai_profile_consent: true,
    created_at: '2026-04-18T08:00:00.000Z', updated_at: '2026-04-18T08:00:00.000Z',
  },
]

export function getLeadsByPersonId(personId: string): Lead[] {
  return MOCK_LEADS.filter(l => l.assigned_to_user_id === personId)
}
