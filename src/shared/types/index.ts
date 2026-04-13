export type Stage = 'awareness' | 'interest' | 'consideration' | 'intent' | 'enrolled' | 'retention';
export type LeadStatus = 'pending_review' | 'active' | 'closed_won' | 'closed_lost' | 'on_hold' | 'blacklisted';
export type SlaStatus = 'ok' | 'warning' | 'breached';
export type Priority = 'urgent' | 'today' | 'week' | 'done';
export type ConsultantRole = 'consultant' | 'leader' | 'hr_manager' | 'admin' | 'owner';
export type ActionType = 'stage_advanced' | 'stage_regressed' | 'note_added' | 'note_edited' | 'note_deleted' | 'assigned' | 'reassigned' | 'transfer_initiated' | 'co_deal_created' | 'enrolled' | 'lead_returned' | 'sla_breach_detected' | 'lead_approved' | 'lead_blacklisted';
export type CoDealStatus = 'active' | 'completed' | 'cancelled';
export type StudentAccountStatus = 'pending' | 'activated' | 'failed';
export type LoadStatus = 'green' | 'yellow' | 'red';

export interface ConsultantSummary { id: string; full_name: string; avatar_url: string | null; role?: ConsultantRole; team_id?: string | null; team_name?: string | null; }
export interface LeadSource { id: string; code: string; label: string; color_hex: string; }
export interface Program { id: string; code: string; name: string; base_price: number | null; currency: string; }
export interface PaymentMethod { id: string; code: string; label: string; }
export interface RegressionReason { id: string; code: string; label: string; is_custom: boolean; }
export interface PaginationMeta { total: number; page: number; per_page: number; has_next: boolean; next_cursor: string | null; }

export interface Person { id: string; full_name: string; phone: string | null; email: string | null; date_of_birth: string | null; time_of_birth: string | null; occupation: string | null; avatar_url: string | null; goals: string | null; pain_points: string | null; }

export interface SlaInfo { status: SlaStatus; hours_elapsed: number | null; deadline_at?: string; badge_text?: string | null; }
export interface Lead { id: string; person: Person; parent_lead_id: string | null; source: LeadSource; assigned_consultant: ConsultantSummary | null; current_stage: Stage; status: LeadStatus; sla_status: SlaInfo; quiz_score: number | null; profile_completion_pct: number; is_returning: boolean; first_contact_at: string | null; last_contact_at: string | null; enrolled_at: string | null; co_deal: CoDeal | null; enrollment: Enrollment | null; created_at: string; updated_at: string; }
export interface LeadListItem { id: string; full_name: string; phone: string | null; avatar_url: string | null; current_stage: Stage; status: LeadStatus; sla_status: SlaInfo; action_label: string; priority: Priority; source_code: string; source_label: string; is_returning: boolean; has_co_deal: boolean; profile_hint: string | null; assigned_consultant_id: string | null; created_at: string; }

export interface RegressionReasonPayload { code: string; label: string; custom_text: string | null; }
export interface TimelineDivider { type: 'divider'; label: string; }
export interface PipelineAction { id: string; lead_id: string; actor: ConsultantSummary | null; action_type: ActionType; action_icon: string; action_label: string; from_stage: string | null; to_stage: string | null; regression_reason: RegressionReasonPayload | null; note_content: string | null; payload: Record<string, unknown>; created_at: string; }
export type TimelineItem = PipelineAction | TimelineDivider;

export interface CoDeal { id: string; lead_id: string; primary_consultant: ConsultantSummary; co_consultant: ConsultantSummary; primary_share_pct: number; co_share_pct: number; note: string | null; status: CoDealStatus; created_at: string; }
export interface Enrollment { id: string; lead_id: string; program: Program; primary_consultant: ConsultantSummary; co_deal: CoDeal | null; amount_paid: number; currency: string; payment_method: PaymentMethod; transaction_ref: string | null; student_account_status: StudentAccountStatus; activation_email_sent_at: string | null; learn_account_id: string | null; enrolled_at: string; }

export interface PersonalProfileHeroCard { quote: string; nhat_chu: string; life_path: number; nine_star: string; }
export interface PersonalProfile { id: string; person_id: string; hero_card: PersonalProfileHeroCard; core_personality_summary: string | null; communication_dos: string[]; communication_donts: string[]; true_needs: string | null; current_year_timing: string | null; opening_suggestion: string | null; generated_by: string; generated_at: string; }

export interface KpiSummary { period: string; total_leads_active: number; enrolled_this_month: number; leads_new_7d: number; conversion_rate_pct: number; revenue_this_month: number; currency: string; target_this_month: number; target_progress_pct: number; remaining_to_target: number; }
export interface LeaderboardEntry { rank: number; consultant: ConsultantSummary; enrolled: number; target: number; revenue: number; progress_pct: number; load_status: LoadStatus; is_me: boolean; needs_support: boolean; }
export interface ConsultantLoad { consultant_id: string; full_name: string; active_leads: number; max_capacity: number; load_percentage: number; load_status: LoadStatus; }

export interface StageGuideChecklistItem { id: string; text: string; order: number; }
export interface StageGuide { stage: Stage; title: string; eyebrow_label: string; color_hex: string; action_label: string; script_template: string | null; checklist_items: StageGuideChecklistItem[]; }

export interface UserProfile { id: string; full_name: string; email: string; avatar_url: string | null; role: ConsultantRole; team_id: string | null; team_name: string | null; permissions: string[]; }
export interface ApiResponse<T> { data: T; }
export interface ApiListResponse<T> { data: T[]; meta: PaginationMeta; }
export interface ErrorResponse { code: string; message: string; details?: Record<string, unknown>; request_id: string; }
