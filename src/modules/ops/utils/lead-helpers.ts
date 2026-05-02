import type { Todo, Profile } from '@modules/ops/types'
import { FUNNEL_LAYERS } from '@modules/ops/constants/funnel'
import { PF_FIELDS } from '@modules/ops/constants/ui'

// Lookup funnel layer (attract/convert/nurture/close/delight) cho 1 stage.
// Default = nurture (layer index 2) — fallback cho stage chưa map.
export function getFunnelLayer(stage: number) {
  return FUNNEL_LAYERS.find(l => l.stages.includes(stage)) || FUNNEL_LAYERS[2]
}

// Format "DD/MM/YYYY HH:MM" theo Vietnamese locale.
export function nowStr() {
  const d = new Date()
  return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

// Tính tuổi từ DOB string. Hỗ trợ 'YYYY-MM-DD' (BE) và 'DD/MM/YYYY' (UI input).
export function calcAge(dob: string) {
  try {
    const parts = dob.includes('-') ? dob.split('-') : dob.split('/').reverse()
    return new Date().getFullYear() - parseInt(parts[0]) + ' tuổi'
  } catch {
    return ''
  }
}

// Profile completion % = 2 (DOB+gender base) + số PF_FIELDS đã filled.
// Hiển thị banner "Hồ sơ N% — bổ sung..." trong CallScreen.
export function getProfilePct(t: Todo) {
  const filled = PF_FIELDS.filter(f => (t.profile[f.key as keyof Profile] || '').trim()).length
  return Math.round(((2 + filled) / (2 + PF_FIELDS.length)) * 100)
}

// Build HTML hint trên lead card: "<age> · <job>". Fallback "Xem trong hồ sơ".
export function buildHintTxt(t: Todo) {
  const p = t.profile
  const h: string[] = []
  if (p.dob) {
    const a = calcAge(p.dob)
    if (a) h.push(`<strong>${a}</strong>`)
  }
  if (p.job) h.push(`<strong>${p.job}</strong>`)
  return h.join(' · ') || 'Xem trong hồ sơ'
}
