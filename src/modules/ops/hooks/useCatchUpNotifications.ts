import { useEffect, useRef } from 'react'
import { api } from '@shared/config/api-client'
import { useNotificationStore } from '@shared/stores/notification-store'
import {
  OPS_SCOPE,
  type UnseenResponse,
} from '@shared/types/notifications'

// Catch-up on mount: lead mới kể từ bookmark.
//   n=0 → skip
//   n=1 → stagger (1 toast, cảm giác realtime)
//   n≥2 → gộp 1 toast "N lead mới khi bạn vắng"
// Sau khi toast hiển thị (fire-and-forget, không chờ), PATCH mark-seen với
// up_to = meta.max_occurred_at để bookmark lên đúng mốc cuối của batch vừa show.
// KHÔNG dùng NOW() ở BE — tránh mất lead ingest xen giữa lúc user mở app.
//
// Chạy 1 lần duy nhất per mount (ref guard) — dùng TanStack Query sẽ rắc rối
// vì hook này có side effect (toast) không đồng bộ lifecycle với cache.
export function useCatchUpNotifications(enabled: boolean) {
  const push = useNotificationStore((s) => s.push)
  const ranRef = useRef(false)

  useEffect(() => {
    if (!enabled || ranRef.current) return
    ranRef.current = true

    void (async () => {
      let res: UnseenResponse | undefined
      try {
        // getRaw để giữ { data, meta } (api.get sẽ unwrap .data, mất meta).
        res = await api.getRaw<UnseenResponse>(
          `/notifications/unseen?scope=${OPS_SCOPE}`,
        )
      } catch {
        return
      }
      if (!res || res.data.length === 0) return

      if (res.data.length === 1) {
        const lead = res.data[0]
        push({
          icon: '📬',
          text: 'Lead mới khi bạn vắng',
          sub: `${lead.source}${lead.source_channel ? ' · ' + lead.source_channel : ''}`,
        })
      } else {
        const sinceLabel = res.meta.since
          ? new Date(res.meta.since).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : null
        push({
          icon: '📬',
          text: `${res.data.length}${res.meta.has_more ? '+' : ''} lead mới khi bạn vắng`,
          sub: sinceLabel ? `Từ ${sinceLabel}` : 'Xem danh sách lead',
        })
      }

      const upTo = res.meta.max_occurred_at
      if (upTo) {
        api
          .patch('/notifications/mark-seen', {
            scope: OPS_SCOPE,
            up_to: upTo,
          })
          .catch(() => {
            /* lần mở app sau lặp lại — acceptable */
          })
      }
    })()
  }, [enabled, push])
}
