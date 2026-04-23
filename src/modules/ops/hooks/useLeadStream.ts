import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeSse } from '@shared/config/sse-client'
import { api } from '@shared/config/api-client'
import { useNotificationStore } from '@shared/stores/notification-store'
import {
  OPS_SCOPE,
  OPS_EVENT_TYPES,
  type OpsLeadIngestedEvent,
} from '@shared/types/notifications'

// Live SSE stream cho ops:
//   - Mở GET /notifications/stream?scope=ops với Bearer token (fetch stream).
//   - Khi có event lead.ingested:
//       (a) push toast góc phải dưới
//       (b) invalidate TanStack queries liên quan → list/dashboard tự refetch
//       (c) PATCH /notifications/mark-seen { scope, up_to: occurredAt }
//           → consultant online nhận toast rồi sẽ KHÔNG thấy lead đó trong
//             unseen khi mở app lần sau (fix "live toast ≠ seen" gap).
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
        if (msg.type !== OPS_EVENT_TYPES.LEAD_INGESTED) return
        let event: OpsLeadIngestedEvent
        try {
          event = JSON.parse(msg.data) as OpsLeadIngestedEvent
        } catch {
          return
        }

        push({
          icon: '📢',
          text: 'Lead mới',
          sub: `${event.payload.source}${event.payload.source_channel ? ' · ' + event.payload.source_channel : ''}`,
        })

        qc.invalidateQueries({ queryKey: ['ops', 'leads'] })
        qc.invalidateQueries({ queryKey: ['ops', 'dashboard'] })

        // Bump bookmark tới occurredAt (không phải NOW) để tránh race với
        // ingest xảy ra ngay sau. Fire-and-forget: lỗi không block UI.
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
        // TODO: fallback polling refetchInterval 15s nếu SSE disconnect > 10s.
        // Phase hiện tại — 1 user online ops, TanStack Query staleTime ngắn đã
        // đủ. Ghi tech debt.
      },
    }).catch(() => {
      /* swallow AbortError + network */
    })

    return () => ctrl.abort()
  }, [enabled, qc, push])
}
