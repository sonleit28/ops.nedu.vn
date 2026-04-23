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
  assigned_to_user_id: string
  assigned_to_full_name: string
  birth_date?: string
  birth_time?: string
  occupation?: string
  goal?: string
  main_concern?: string
  test_score?: number
  interested_programs: ProgramSlug[]
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
