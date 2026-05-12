export type { Role } from '@shared/types/auth'

export type PipelineStage = 'awareness' | 'interest' | 'consideration' | 'intent' | 'enrolled' | 'retention'
export type LeadSource = 'inbound' | 'marketing' | 'referral' | 'alumni'
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'e_wallet'
export type ProgramSlug = 'la-chinh-minh' | 'adult-learning' | 'executive' | 'short-course' | 'corporate'

export type LeadTemperature = 'hot' | 'warm' | 'cold'
export type LeadGender = 'male' | 'female'

// Free-form metadata bag — keys do FE/BE thoả thuận, không bị schema enforce.
// `temperature` quyết định màu thẻ lead ở sidebar (hot=đỏ, warm=vàng).
// `gender` bắt buộc khi generate personal profile (nlh-vault yêu cầu).
// `birth_place`/`birth_lat`/`birth_lng` optional — bật được natal chart ở vault.
export interface LeadMetadata {
  temperature?: LeadTemperature
  gender?: LeadGender
  birth_place?: string
  birth_lat?: number
  birth_lng?: number
  [key: string]: unknown
}

export interface Lead {
  id: string
  full_name: string
  phone: string
  email?: string
  stage: PipelineStage
  source: LeadSource
  source_channel?: string | null
  // Nullable kể từ BE fe7b9d5 + 5d92d0b: hieucon B2C + quiz ingest tạo lead
  // chưa phân công, leader/admin assign sau từ ops portal.
  assigned_to_user_id: string | null
  assigned_to_full_name: string | null
  birth_date?: string
  birth_time?: string
  occupation?: string
  goal?: string
  main_concern?: string
  test_score?: number
  // BE column courses.code (vd: 'TKBT', 'LCM'). Free-form string vì BE soft-validate.
  interested_courses: string[]
  sla_breached: boolean
  sla_breach_hours?: number
  is_returning: boolean
  has_co_deal: boolean
  profile_completion_pct: number
  ai_profile_consent: boolean
  metadata?: LeadMetadata | null
  created_at: string
  updated_at: string
}

export interface PipelineAction {
  id: string
  lead_id: string
  action_type: 'stage_advanced' | 'stage_regressed' | 'note_added' | 'lead_assigned' | 'lead_transferred' | 'co_deal_created' | 'enrolled' | 'profile_updated' | 'ai_profile_generated'
  performed_by_person_id: string
  performed_by_full_name: string
  stage_from?: PipelineStage
  stage_to?: PipelineStage
  regression_reason?: string
  note_content?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface LeadNote {
  id: string
  lead_id: string
  person_id: string
  author_full_name: string
  content: string
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  lead_id: string
  program_id: string
  program_slug: ProgramSlug
  enrolled_by_person_id: string
  payment_amount: number
  payment_method: PaymentMethod
  transaction_ref?: string
  student_account_created: boolean
  activation_email_sent: boolean
  enrolled_at: string
  created_at: string
}

export interface CoDeal {
  id: string
  lead_id: string
  initiator_person_id: string
  co_dealer_person_id: string
  initiator_ratio: number
  co_dealer_ratio: number
  note?: string
  created_at: string
}

export interface PersonalProfile {
  id: string
  lead_id: string
  generated_by_person_id: string
  generator?: 'stub' | 'vault'
  core_personality: string
  communication_dos: string[]
  communication_donts: string[]
  real_need: string
  timing_2026: string
  opening_suggestion: string
  // 5-system chip snapshot:
  life_path_number?: number | null       // Thần số học
  nhut_chu?: string | null                // Bát tự — Day Master
  nine_star?: string | null               // Nine Star Ki — Year Star
  sun_sign?: string | null                // Cung hoàng đạo — Sun sign
  menh_cuc?: string | null                // Tử vi — Mệnh Cục
  created_at: string
  updated_at: string
}

export interface DashboardSummary {
  person_id: string
  active_leads_count: number
  load_pct: number
  urgent_leads_count: number
  leads_today: number
}

export interface KpiData {
  month: string
  summary: {
    total_active_leads: number
    enrolled_this_month: number
    new_leads_last_7_days: number
    conversion_rate: number
    monthly_target: number
    monthly_revenue_vnd: number
  }
  consultants: Array<{
    person_id: string
    full_name: string
    enrolled_count: number
    target: number
    revenue_vnd: number
    active_leads: number
    load_pct: number
    badges: string[]
  }>
}

// E-08 — Team leaderboard (GET /api/ops/kpi/team).
export interface KpiTeamMember {
  user_id: string
  full_name: string
  role: 'consultant' | 'leader'
  enrolled_count: number
  target: number
  revenue_vnd: number
  active_leads: number
  load_pct: number
  needs_support: boolean
  is_me: boolean
}

export interface KpiTeamData {
  month: string
  summary: {
    enrolled_this_month: number
    monthly_target: number
    monthly_revenue_vnd: number
    active_leads: number
    conversion_rate: number
  }
  members: KpiTeamMember[]
}

// ─── UI types (consumer: App.tsx + sub-components) ─────────────────────────
// Khác với BE types ở trên — đây là shape sau khi mapper transform để render UI
// hiện tại. leadToTodo() chuyển BE Lead → Todo, toDisplayMembers chuyển
// KpiTeamMember[] → DisplayTeamMember[].

// Profile = nested birth/personal info trong Todo (khác BE Lead struct).
export interface Profile {
  dob: string
  birthTime: string
  job: string
  goal: string
  pain: string
  gender?: LeadGender
}

// Timeline item — mixed event/divider hiển thị trong CallScreen.
export interface TLItem {
  icon?: string
  action?: string
  date?: string
  who?: string
  note?: string
  isDivider?: boolean
  label?: string
}

export interface NoteItem {
  text: string
  date: string
  who: string
  id?: string
}

// Todo = UI lead model. Numeric id (deterministic map từ BE UUID), profile
// nested, timeline mock, done flag... Đây là shape Stable UI; Lead BE map vào.
export interface Todo {
  id: number
  priority: string
  action: string
  name: string
  badge: string
  badgeColor: string
  desc: string
  stage: number
  phone: string
  email: string
  sourceType: string
  sourceCh: string
  color: string
  days: number
  testScore: number
  testDesc: string
  note: string
  profile: Profile
  courses: string[]
  timeline: TLItem[]
  notes: NoteItem[]
  done: boolean
  temperature?: LeadTemperature
  aiProfileConsent?: boolean
  codeal?: { name: string; split: number }[]
  assignedTo?: string
  // TODO post-refactor: tighten thay any (legacy field, chưa có schema rõ).
  payment?: unknown
}

// AI profile card — render trong CallScreen tab AI.
export interface ProfileCard {
  gen: boolean
  // 5-system chip snapshot
  dm: string      // Bát tự — Day Master (nhut_chu)
  lp: string      // Thần số học — Life Path
  nk: string      // Nine Star Ki — year star
  sun: string     // Cung hoàng đạo — Sun sign
  menh: string    // Tử vi — Mệnh Cục
  gua: string     // (legacy, giữ lại cho compat)
  q: string
  core: string
  talk: { y: boolean; t: string }[]
  need: string
  timing: string
  opening: string
}

// KPI team member sau khi transform từ BE KpiTeamMember → UI shape.
export interface DisplayTeamMember {
  id: string
  name: string
  role: 'consultant' | 'leader'
  color: string
  enrolled: number
  target: number
  revenue: number
  isMe: boolean
}
