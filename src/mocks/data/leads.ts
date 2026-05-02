// src/mocks/data/leads.ts
import type { Lead } from '@modules/ops/types'
import { MOCK_PERSONS } from './persons'

// Linh Nguyễn = MOCK_PERSONS[2] (default consultant persona)
const LINH = MOCK_PERSONS[2]

// Mock data theo 4 nhóm:
// - Active (assigned cho Linh): 3 lead ở stage 1 / 3 / 4
// - Unassigned pool: 2 lead chưa ai nhận
// - Upsell pool: 1 học viên cũ muốn đăng ký tiếp
// - Dropped: 2 lead rớt theo SLA rule
// - Enrolled (đã chốt): 3 học viên
//
// SLA rule (chỉ simulate, không tự động compute thời gian):
//   awareness  >24h        → drop
//   interest   >24h        → drop (chưa liên hệ)
//   considera. >3 ngày     → drop (không follow)
//   intent     >48h        → drop (không hoạt động)
export let MOCK_LEADS: Lead[] = [
  // ─── ACTIVE — assigned cho Linh Nguyễn (3 lead) ───────────────
  {
    id: 'lead-active-01',
    full_name: 'Phạm Thu Hằng', phone: '0901100001', email: 'hang.pham@example.com',
    stage: 'awareness', source: 'inbound', source_channel: 'nedu.vn/test',
    assigned_to_user_id: LINH.id, assigned_to_full_name: LINH.full_name,
    birth_date: '1995-03-15', birth_time: '08:30',
    occupation: 'Nhân viên văn phòng', goal: 'Hiểu bản thân hơn',
    main_concern: 'Chưa biết chọn khóa nào', test_score: 78,
    interested_courses: ['LCM'],
    sla_breached: false, is_returning: false,
    has_co_deal: false, profile_completion_pct: 65, ai_profile_consent: true,
    metadata: { temperature: 'hot' },
    created_at: '2026-04-30T10:00:00.000Z', updated_at: '2026-04-30T10:00:00.000Z',
  },
  {
    id: 'lead-active-02',
    full_name: 'Trần Quốc Anh', phone: '0901100002', email: 'quocanh@example.com',
    stage: 'consideration', source: 'marketing', source_channel: 'fb-ads-T4/2026',
    assigned_to_user_id: LINH.id, assigned_to_full_name: LINH.full_name,
    birth_date: '1990-07-22',
    occupation: 'Quản lý cấp trung', goal: 'Nâng cao kỹ năng lãnh đạo',
    main_concern: 'Bận rộn, khó sắp xếp thời gian', test_score: 85,
    interested_courses: ['TKBT', 'COACHING'],
    sla_breached: false, is_returning: false, has_co_deal: false,
    profile_completion_pct: 80, ai_profile_consent: false,
    metadata: { temperature: 'warm' },
    created_at: '2026-04-28T09:00:00.000Z', updated_at: '2026-05-01T07:00:00.000Z',
  },
  {
    id: 'lead-active-03',
    full_name: 'Nguyễn Bảo Châu', phone: '0901100003', email: 'baochau@example.com',
    stage: 'intent', source: 'referral', source_channel: 'alumni-K12',
    assigned_to_user_id: LINH.id, assigned_to_full_name: LINH.full_name,
    birth_date: '1988-11-01', birth_time: '14:00',
    occupation: 'Chủ kinh doanh nhỏ', goal: 'Phát triển doanh nghiệp',
    interested_courses: ['LCM'], test_score: 92,
    sla_breached: false, is_returning: false, has_co_deal: false,
    profile_completion_pct: 90, ai_profile_consent: true,
    metadata: { temperature: 'hot' },
    created_at: '2026-04-25T08:00:00.000Z', updated_at: '2026-04-30T16:00:00.000Z',
  },

  // ─── UNASSIGNED — pool chưa ai nhận (2 lead) ──────────────────
  {
    id: 'lead-unassigned-01',
    full_name: 'Lê Hoàng Nam', phone: '0901200001', email: 'hoangnam@example.com',
    stage: 'awareness', source: 'inbound', source_channel: 'nedu.vn/consultation-form',
    assigned_to_user_id: '', assigned_to_full_name: '— Chưa ai nhận —',
    interested_courses: ['LCM'], test_score: 70,
    sla_breached: false, is_returning: false, has_co_deal: false,
    profile_completion_pct: 30, ai_profile_consent: false,
    metadata: { temperature: 'warm' },
    created_at: '2026-05-01T06:30:00.000Z', updated_at: '2026-05-01T06:30:00.000Z',
  },
  {
    id: 'lead-unassigned-02',
    full_name: 'Vũ Mai Anh', phone: '0901200002', email: 'maianh@example.com',
    stage: 'awareness', source: 'marketing', source_channel: 'tiktok-ads',
    assigned_to_user_id: '', assigned_to_full_name: '— Chưa ai nhận —',
    interested_courses: ['WS-JOURNAL'], test_score: 65,
    sla_breached: false, is_returning: false, has_co_deal: false,
    profile_completion_pct: 25, ai_profile_consent: false,
    metadata: { temperature: 'cold' },
    created_at: '2026-05-01T08:00:00.000Z', updated_at: '2026-05-01T08:00:00.000Z',
  },

  // ─── UPSELL — học viên cũ muốn đăng ký tiếp (1 lead, assignedTo null) ──
  {
    id: 'lead-upsell-01',
    full_name: 'Đỗ Minh Khang', phone: '0901300001', email: 'minhkhang@example.com',
    stage: 'interest', source: 'alumni', source_channel: 'alumni-portal',
    assigned_to_user_id: '', assigned_to_full_name: '— Chưa ai nhận —',
    occupation: 'Giám đốc Marketing', goal: 'Học khóa nâng cao tiếp theo',
    main_concern: 'Đã học LCM, muốn đăng ký Executive Track',
    interested_courses: ['COACHING'], test_score: 88,
    sla_breached: false, is_returning: true, has_co_deal: false,
    profile_completion_pct: 95, ai_profile_consent: true,
    metadata: { temperature: 'hot' },
    created_at: '2026-04-29T11:00:00.000Z', updated_at: '2026-04-29T11:00:00.000Z',
  },

  // ─── DROPPED — rớt theo SLA (2 lead) ──────────────────────────
  {
    id: 'lead-dropped-01',
    full_name: 'Bùi Tuấn Kiệt', phone: '0901400001', email: 'tuankiet@example.com',
    stage: 'interest', source: 'marketing', source_channel: 'fb-ads-T3/2026',
    assigned_to_user_id: LINH.id, assigned_to_full_name: LINH.full_name,
    interested_courses: ['LCM'], test_score: 60,
    // Stage 'interest' >24h chưa liên hệ → SLA breach 32h
    sla_breached: true, sla_breach_hours: 32, is_returning: false, has_co_deal: false,
    profile_completion_pct: 40, ai_profile_consent: false,
    metadata: { temperature: 'cold' },
    created_at: '2026-04-29T22:00:00.000Z', updated_at: '2026-04-29T22:00:00.000Z',
  },
  {
    id: 'lead-dropped-02',
    full_name: 'Hoàng Diệu Linh', phone: '0901400002', email: 'dieulinh@example.com',
    stage: 'consideration', source: 'inbound', source_channel: 'nedu.vn/blog',
    assigned_to_user_id: LINH.id, assigned_to_full_name: LINH.full_name,
    interested_courses: ['TKBT'], test_score: 75,
    // Stage 'consideration' >3 ngày không follow → SLA breach 78h (3.25 ngày)
    sla_breached: true, sla_breach_hours: 78, is_returning: false, has_co_deal: false,
    profile_completion_pct: 55, ai_profile_consent: false,
    metadata: { temperature: 'cold' },
    created_at: '2026-04-27T18:00:00.000Z', updated_at: '2026-04-28T10:00:00.000Z',
  },

  // ─── ENROLLED — đã chốt (3 học viên) ──────────────────────────
  {
    id: 'lead-enrolled-01',
    full_name: 'Ngô Thanh Hà', phone: '0901500001', email: 'thanhha@example.com',
    stage: 'enrolled', source: 'referral', source_channel: 'alumni-K10',
    assigned_to_user_id: LINH.id, assigned_to_full_name: LINH.full_name,
    occupation: 'CEO Khởi nghiệp', interested_courses: ['COACHING'], test_score: 95,
    sla_breached: false, is_returning: false, has_co_deal: false,
    profile_completion_pct: 100, ai_profile_consent: true,
    metadata: { temperature: 'hot' },
    created_at: '2026-04-15T08:00:00.000Z', updated_at: '2026-04-22T15:00:00.000Z',
  },
  {
    id: 'lead-enrolled-02',
    full_name: 'Lý Phương Uyên', phone: '0901500002', email: 'phuonguyen@example.com',
    stage: 'enrolled', source: 'inbound', source_channel: 'nedu.vn/test',
    assigned_to_user_id: LINH.id, assigned_to_full_name: LINH.full_name,
    occupation: 'Designer', interested_courses: ['LCM'], test_score: 82,
    sla_breached: false, is_returning: false, has_co_deal: true,
    profile_completion_pct: 100, ai_profile_consent: true,
    metadata: { temperature: 'warm' },
    created_at: '2026-04-10T10:00:00.000Z', updated_at: '2026-04-20T11:00:00.000Z',
  },
  {
    id: 'lead-enrolled-03',
    full_name: 'Phan Anh Tuấn', phone: '0901500003', email: 'anhtuan@example.com',
    stage: 'retention', source: 'marketing', source_channel: 'google-ads',
    assigned_to_user_id: LINH.id, assigned_to_full_name: LINH.full_name,
    occupation: 'Bác sĩ', interested_courses: ['TKBT'], test_score: 88,
    sla_breached: false, is_returning: false, has_co_deal: false,
    profile_completion_pct: 100, ai_profile_consent: true,
    metadata: { temperature: 'warm' },
    created_at: '2026-03-25T09:00:00.000Z', updated_at: '2026-04-05T14:00:00.000Z',
  },
]

export function getLeadsByPersonId(personId: string): Lead[] {
  return MOCK_LEADS.filter(l => l.assigned_to_user_id === personId)
}
