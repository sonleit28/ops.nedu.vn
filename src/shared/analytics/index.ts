import { env } from '@shared/config/env'
import { ga4 } from './ga4'
import type { EventMap, EventName } from './events'

// Chỉ enable trên prod build + hostname đã chốt. Mọi case khác (dev,
// preview, mock, hostname khác) → no-op để tránh làm bẩn data.
const ENABLED_HOSTNAMES = new Set(['ops.nedu.vn'])

let initialized = false
let enabled = false

function shouldEnable(): boolean {
  if (!import.meta.env.PROD) return false
  if (typeof window === 'undefined') return false
  return ENABLED_HOSTNAMES.has(window.location.hostname)
}

export const analytics = {
  init() {
    if (initialized) return
    initialized = true
    enabled = shouldEnable()
    if (!enabled) return

    if (env.VITE_GA4_ID) ga4.load(env.VITE_GA4_ID)
  },

  pageView(path: string, title?: string) {
    if (!enabled) return
    ga4.pageView(path, title)
  },

  identify(userId: string, properties?: Record<string, string | undefined>) {
    if (!enabled) return
    const cleaned = properties
      ? Object.fromEntries(Object.entries(properties).filter(([, v]) => !!v))
      : undefined
    ga4.identify(userId, cleaned)
  },

  reset() {
    if (!enabled) return
    ga4.reset()
  },

  track<K extends EventName>(
    name: K | (string & {}),
    params?: K extends EventName ? EventMap[K] : Record<string, unknown>,
  ) {
    if (!enabled) return
    ga4.event(name as string, params as Record<string, unknown> | undefined)
  },
}

export type { EventMap, EventName }
