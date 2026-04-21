// src/mocks/init.ts
import { env } from '@shared/config/env'

export async function enableMocking() {
  if (!env.VITE_ENABLE_MOCKING) return
  const { worker } = await import('./browser')
  // 'warn' thay v\u00ec 'bypass': n\u1ebfu request t\u1edbi /api/... m\u00e0 kh\u00f4ng c\u00f3 handler,
  // console s\u1ebd c\u1ea3nh b\u00e1o \u0111\u1ec3 team vibe coding bi\u1ebft c\u1ea7n th\u00eam mock handler.
  // Static assets (font/image/etc) kh\u00f4ng li\u00ean quan s\u1ebd \u0111\u01b0\u1ee3c b\u1ecf qua v\u00ec kh\u00f4ng match glob.
  return worker.start({
    onUnhandledRequest: (request, print) => {
      const url = new URL(request.url)
      if (url.pathname.startsWith('/api/')) {
        print.warning()
      }
    },
  })
}
