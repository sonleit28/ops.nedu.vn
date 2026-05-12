import type { Lead as BackendLead, Todo } from '@modules/ops/types'
import { STAGE_TO_NUM, STAGE_COLOR } from '@modules/ops/constants/stages'
import { COURSE_CODE_TO_UI } from '@modules/ops/constants/courses'

// Backend Lead → Todo mapper.
// Backend trả UUID string; UI gốc dùng id:number. Giữ bảng map module-level
// để các mutation sau biết UUID thật khi cần.

export const UUID_BY_NUMERIC_ID: Record<number, string> = {}
export const NUMERIC_ID_BY_UUID: Record<string, number> = {}
let nextNumericId = 1

export function numericIdFor(uuid: string): number {
  if (uuid in NUMERIC_ID_BY_UUID) return NUMERIC_ID_BY_UUID[uuid]
  const n = nextNumericId++
  NUMERIC_ID_BY_UUID[uuid] = n
  UUID_BY_NUMERIC_ID[n] = uuid
  return n
}

export function leadToTodo(lead: BackendLead): Todo {
  const stage = STAGE_TO_NUM[lead.stage] ?? 1
  const isMarketing = lead.source === 'marketing'
  const priority = lead.sla_breached || stage <= 2 ? 'urgent' : 'today'
  const badge = lead.sla_breached
    ? `⚠ Quá hạn${lead.sla_breach_hours ? ' ' + lead.sla_breach_hours + 'h' : ''}`
    : lead.is_returning ? '🔄 Khách cũ'
    : isMarketing ? '📢 Quảng cáo'
    : `Giai đoạn ${stage}`
  const badgeColor = lead.sla_breached ? 'red'
    : lead.is_returning ? 'amber'
    : isMarketing ? 'blue'
    : stage >= 4 ? 'green' : 'purple'
  const action = stage === 4 ? 'CHỐT DEAL' : stage >= 3 ? 'TƯ VẤN' : 'GỌI NGAY'
  const createdAt = new Date(lead.created_at)
  const now = new Date()
  const days = Math.max(0, Math.floor((now.getTime() - createdAt.getTime()) / 86400000))

  return {
    id: numericIdFor(lead.id),
    priority, action,
    name: lead.full_name,
    badge, badgeColor,
    desc: lead.main_concern ?? lead.goal ?? '',
    stage,
    phone: lead.phone,
    email: lead.email ?? '',
    sourceType: isMarketing ? 'marketing' : 'inbound',
    // Đọc source_channel thật từ BE (vd: "nedu.vn/consultation-form", "nedu.vn/test", "fb-ads-T4").
    // Fallback theo source khi BE chưa cấp channel cụ thể.
    sourceCh: lead.source_channel ?? (isMarketing ? 'Chiến dịch quảng cáo' : 'inbound'),
    color: STAGE_COLOR[stage] ?? '#8B5CF6',
    days,
    testScore: lead.test_score ?? 0,
    testDesc: lead.test_score ? `Điểm test: ${lead.test_score}/100` : 'Chưa làm test',
    note: '',
    profile: {
      dob: lead.birth_date ?? '',
      birthTime: lead.birth_time ?? '',
      job: lead.occupation ?? '',
      goal: lead.goal ?? '',
      pain: lead.main_concern ?? '',
      gender: lead.metadata?.gender as ('male' | 'female' | undefined),
    },
    courses: lead.interested_courses.map(c => COURSE_CODE_TO_UI[c]).filter(Boolean),
    timeline: [],
    notes: [],
    done: lead.stage === 'enrolled' || lead.stage === 'retention',
    temperature: lead.metadata?.temperature,
    aiProfileConsent: lead.ai_profile_consent,
    assignedTo: lead.assigned_to_full_name ?? undefined,
  }
}
