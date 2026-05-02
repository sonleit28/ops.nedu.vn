import type { KpiTeamMember, DisplayTeamMember } from '@modules/ops/types'
import { TEAM_AVATAR_PALETTE } from '@modules/ops/constants/ui'

// Hash deterministic user_id → avatar color trong palette để mỗi member
// giữ 1 màu cố định qua các lần render.
export function pickAvatarColor(userId: string): string {
  let h = 0
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) | 0
  return TEAM_AVATAR_PALETTE[Math.abs(h) % TEAM_AVATAR_PALETTE.length]
}

// Transform BE KpiTeamMember[] → UI DisplayTeamMember[] (rename fields,
// gắn color, tách is_me).
export function toDisplayMembers(members: KpiTeamMember[] | undefined): DisplayTeamMember[] {
  if (!members) return []
  return members.map(m => ({
    id: m.user_id,
    name: m.full_name,
    role: m.role,
    color: pickAvatarColor(m.user_id),
    enrolled: m.enrolled_count,
    target: m.target,
    revenue: m.revenue_vnd,
    isMe: m.is_me,
  }))
}
