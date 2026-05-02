import type { PipelineAction } from '@modules/ops/types'

// Icon + Vietnamese label cho mỗi loại pipeline action — render ở timeline
// audit trong CallScreen + lead detail panel.

export function actionIconOf(type: PipelineAction['action_type']): string {
  switch (type) {
    case 'stage_advanced': return '➡️'
    case 'stage_regressed': return '↩️'
    case 'note_added': return '📝'
    case 'lead_assigned': return '📥'
    case 'lead_transferred': return '↔️'
    case 'co_deal_created': return '🤝'
    case 'enrolled': return '✅'
    case 'profile_updated': return '🧩'
    case 'ai_profile_generated': return '✨'
    default: return '•'
  }
}

export function actionLabelOf(a: PipelineAction): string {
  switch (a.action_type) {
    case 'stage_advanced': return `Tiến stage: ${a.stage_from} → ${a.stage_to}`
    case 'stage_regressed': return `Lùi stage: ${a.stage_from} → ${a.stage_to}`
    case 'note_added': return 'Ghi chú cho người kế tiếp'
    case 'lead_assigned': return 'Được giao'
    case 'lead_transferred': return 'Chuyển case'
    case 'co_deal_created': return 'Tạo co-deal'
    case 'enrolled': return 'Đã chốt'
    case 'profile_updated': return 'Cập nhật hồ sơ'
    case 'ai_profile_generated': return 'Tạo Hồ sơ AI'
    default: return a.action_type
  }
}
