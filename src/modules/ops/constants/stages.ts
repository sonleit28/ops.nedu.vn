import type { PipelineStage } from '@modules/ops/types'

// Map BE pipeline stage enum → numeric stage 1-6 dùng trong UI funnel.
export const STAGE_TO_NUM: Record<PipelineStage, number> = {
  awareness: 1,
  interest: 2,
  consideration: 3,
  intent: 4,
  enrolled: 5,
  retention: 6,
}

// Stage color cho badge + funnel bar.
export const STAGE_COLOR: Record<number, string> = {
  1: '#EF4444',
  2: '#F59E0B',
  3: '#8B5CF6',
  4: '#06B6D4',
  5: '#059669',
  6: '#3B82F6',
}

// Sync với backend CONSULTANT_MAX_ACTIVE_LEADS — leader cảnh báo khi vượt.
// ⚠ Phải update đồng bộ khi BE đổi constant này. Tốt hơn: BE expose qua
// endpoint /api/ops/config (post-golive task).
export const LOAD_CAPACITY = 20
