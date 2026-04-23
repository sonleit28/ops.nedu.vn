// Mirror của BE NotificationEvent (src/modules/notifications/notification-event.types.ts).
// Shape generic — ops.nedu.vn chỉ handle scope='ops', nhưng type giữ nguyên
// generic để future portal tái sử dụng cùng contract.

export interface NotificationEvent<P = Record<string, unknown>> {
  id: string
  scope: string
  type: string
  audience: { userId?: string; roles?: string[] }
  payload: P
  occurredAt: string
}

// Mirror của src/contracts/ops.events.contract.ts trên BE.
// Giữ type name + field name 1-1 để khi BE đổi, TS bắt được lỗi ngay.
export const OPS_SCOPE = 'ops' as const

export const OPS_EVENT_TYPES = {
  LEAD_INGESTED: 'lead.ingested',
} as const

export interface OpsLeadIngestedPayload {
  lead_id: string
  assigned_to_user_id: string
  source: string
  source_channel: string | null
  stage: string
}

export type OpsLeadIngestedEvent = NotificationEvent<OpsLeadIngestedPayload>

// Card shape trả về từ GET /notifications/unseen?scope=ops.
// Không chứa full_name/phone (BE trim vì privacy) — FE refetch detail nếu cần.
export interface UnseenLeadCard {
  id: string
  source: string
  source_channel: string | null
  stage: string
  assigned_to_user_id: string
  created_at: string
}

export interface UnseenResponse {
  data: UnseenLeadCard[]
  meta: {
    since: string | null
    max_occurred_at: string | null
    has_more: boolean
  }
}
