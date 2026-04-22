// src/mocks/init.ts
import { env } from '@shared/config/env'

const RELOAD_FLAG = 'msw_cleanup_reloaded'

/**
 * Gỡ service worker MSW + toàn bộ cache storage.
 *
 * Vòng đời Service Worker:
 * - SW persist ở browser ngay cả sau khi code không còn gọi worker.start().
 * - Khi tab load mới, SW cũ đã ACTIVE và intercept request NGAY — trước cả khi
 *   JS app kịp chạy unregister. Vì vậy phải unregister + reload 1 lần.
 * - `RELOAD_FLAG` trong sessionStorage để tránh loop reload vô hạn.
 *
 * Chủ động unregister MỌI registration (không chỉ lọc theo tên) vì tên script
 * có thể thay đổi giữa các version MSW, và app này không dùng SW khác ngoài MSW.
 */
async function cleanupLegacyMockWorker() {
  let needsReload = false

  if ('serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations()
      if (regs.length > 0) {
        needsReload = true
        await Promise.all(regs.map((r) => r.unregister()))
      }
    } catch {
      /* ignore */
    }
  }

  // Xoá Cache Storage (SW có thể đã lưu response cũ).
  if ('caches' in window) {
    try {
      const keys = await caches.keys()
      if (keys.length > 0) {
        needsReload = true
        await Promise.all(keys.map((k) => caches.delete(k)))
      }
    } catch {
      /* ignore */
    }
  }

  // State mock trong localStorage — chỉ xoá nếu chúng ta đang chuyển từ mock sang live.
  try { localStorage.removeItem('mock_uid') } catch { /* ignore */ }

  if (needsReload && !sessionStorage.getItem(RELOAD_FLAG)) {
    sessionStorage.setItem(RELOAD_FLAG, '1')
    console.info('[mocks] Legacy MSW worker + caches cleared — reloading to detach.')
    window.location.reload()
    // Treo bootstrap để React không render với SW cũ còn active trong tab hiện tại.
    await new Promise(() => {})
  } else {
    sessionStorage.removeItem(RELOAD_FLAG)
  }
}

export async function enableMocking() {
  if (!env.VITE_ENABLE_MOCKING) {
    await cleanupLegacyMockWorker()
    return
  }

  const { worker } = await import('./browser')
  // 'warn' thay vì 'bypass': nếu request tới /api/... mà không có handler,
  // console sẽ cảnh báo để team vibe coding biết cần thêm mock handler.
  // Static assets (font/image/etc) không liên quan sẽ được bỏ qua vì không match glob.
  return worker.start({
    onUnhandledRequest: (request, print) => {
      const url = new URL(request.url)
      if (url.pathname.startsWith('/api/')) {
        print.warning()
      }
    },
  })
}
