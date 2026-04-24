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
  LEAD_TRANSFERRED: 'lead.transferred',
  CO_DEAL_CREATED: 'co_deal.created',
} as const

export interface OpsLeadIngestedPayload {
  lead_id: string
  assigned_to_user_id: string
  source: string
  source_channel: string | null
  stage: string
}

export interface OpsLeadTransferredPayload {
  lead_id: string
  from_user_id: string | null
  to_user_id: string
  performed_by_user_id: string
  reason: string | null
}

export interface OpsCoDealCreatedPayload {
  co_deal_id: string
  lead_id: string
  initiator_user_id: string
  co_dealer_user_id: string
  initiator_ratio: number
  co_dealer_ratio: number
}

export type OpsLeadIngestedEvent = NotificationEvent<OpsLeadIngestedPayload>
export type OpsLeadTransferredEvent =
  NotificationEvent<OpsLeadTransferredPayload>
export type OpsCoDealCreatedEvent = NotificationEvent<OpsCoDealCreatedPayload>

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
