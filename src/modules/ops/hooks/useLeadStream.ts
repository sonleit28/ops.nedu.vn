import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeSse } from '@shared/config/sse-client'
import { api } from '@shared/config/api-client'
import { useNotificationStore } from '@shared/stores/notification-store'
import {
  OPS_SCOPE,
  OPS_EVENT_TYPES,
  type NotificationEvent,
  type OpsCoDealCreatedEvent,
  type OpsLeadIngestedEvent,
} from '@shared/types/notifications'

// Live SSE stream cho ops:
//   - Mở GET /notifications/stream?scope=ops với Bearer token (fetch stream).
//   - Với mỗi event:
//       (a) push toast góc phải dưới
//       (b) invalidate TanStack queries liên quan → list/dashboard tự refetch
//       (c) PATCH /notifications/mark-seen { scope, up_to: occurredAt }
//           → consultant online nhận toast rồi sẽ KHÔNG thấy lại khi mở app sau.
//   - Cleanup qua AbortController khi component unmount.
export function useLeadStream(enabled: boolean) {
  const qc = useQueryClient()
  const push = useNotificationStore((s) => s.push)

  useEffect(() => {
    if (!enabled) return
    const ctrl = new AbortController()

    subscribeSse(`/notifications/stream?scope=${OPS_SCOPE}`, {
      signal: ctrl.signal,
      onMessage: (msg) => {
        let event: NotificationEvent
        try {
          event = JSON.parse(msg.data) as NotificationEvent
        } catch {
          return
        }

        let matched = true
        switch (msg.type) {
          case OPS_EVENT_TYPES.LEAD_INGESTED: {
            const e = event as unknown as OpsLeadIngestedEvent
            push({
              icon: '📢',
              text: 'Lead mới',
              sub: `${e.payload.source}${e.payload.source_channel ? ' · ' + e.payload.source_channel : ''}`,
            })
            break
          }
          case OPS_EVENT_TYPES.LEAD_TRANSFERRED: {
            push({
              icon: '🔀',
              text: 'Lead được chuyển cho bạn',
              sub: 'Xem chi tiết trong danh sách lead',
            })
            break
          }
          case OPS_EVENT_TYPES.CO_DEAL_CREATED: {
            const e = event as unknown as OpsCoDealCreatedEvent
            push({
              icon: '🤝',
              text: 'Bạn vừa được co-deal',
              sub: `Tỉ lệ ${e.payload.initiator_ratio}% / ${e.payload.co_dealer_ratio}%`,
            })
            break
          }
          default:
            matched = false
        }
        if (!matched) return

        qc.invalidateQueries({ queryKey: ['ops', 'leads'] })
        qc.invalidateQueries({ queryKey: ['ops', 'dashboard'] })

        // Bump bookmark tới occurredAt (không phải NOW) để tránh race với
        // event xảy ra ngay sau. Fire-and-forget: lỗi không block UI.
        api
          .patch('/notifications/mark-seen', {
            scope: OPS_SCOPE,
            up_to: event.occurredAt,
          })
          .catch(() => {
            /* ignore: lần mở app sau catch-up sẽ hiển thị lại — acceptable */
          })
      },
      onError: () => {
        // SSE disconnect: invalidate ops queries để FE refetch qua REST.
        // Catch-up notification khi user mount lại app được xử lý bởi
        // useCatchUpNotifications (GET /notifications/unseen). Không setup
        // polling dài hạn vì TanStack Query staleTime + refetchOnWindowFocus
        // đủ giữ list/dashboard fresh khi user thao tác.
        qc.invalidateQueries({ queryKey: ['ops', 'leads'] })
        qc.invalidateQueries({ queryKey: ['ops', 'dashboard'] })
      },
    }).catch(() => {
      /* swallow AbortError + network */
    })

    return () => ctrl.abort()
  }, [enabled, qc, push])
}
