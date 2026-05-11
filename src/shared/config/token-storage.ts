/**
 * Token storage — BH-5 Bearer Hardening (2026-05-11).
 *
 * Access token: **MEMORY ONLY** (module-scoped variable, no persist).
 *   - XSS attack window limited: token cleared on reload + only accessible
 *     via this module (KHÔNG store ở Zustand persisted state, React DevTools,
 *     localStorage, sessionStorage)
 *   - Malicious browser extension scrape localStorage → access token NOT
 *     scraped (only refresh)
 *   - Trade-off: page reload = access lost → bootstrap calls /auth/refresh
 *     để re-mint (proactive-refresh.ts handles automatically)
 *
 * Refresh token: localStorage (persist UX — không re-login mỗi reload).
 *   - Mitigation: BH-1 rotation per use + 30d absolute cap + revocation cache
 *   - XSS theft → attacker có refresh chỉ valid until rotation hoặc 30d cap
 *
 * Industry alignment:
 *   - Auth0 SDK official guidance "in-memory + silent refresh"
 *   - OWASP ASVS 4.0 §3.2 ranks in-memory > sessionStorage > localStorage
 *
 * Phase 2 (3-6m): plan migrate sang httpOnly cookie + BFF khi NLH có API
 *   gateway unified domain. Match Google/Meta/Stripe pattern.
 */
const REFRESH_KEY = 'nlh_refresh_token'

export interface TokenPair {
  access_token: string
  refresh_token: string
}

// Memory storage cho access token — module-scoped, no persist, no reactive
// state (avoid React DevTools / Zustand DevTools exposure).
let accessTokenInMemory: string | null = null

// SSR safety guard — Vite SPA hiện tại không SSR nhưng defensive cho
// future migration sang Next.js / SSR framework.
const isBrowser = (): boolean => typeof window !== 'undefined'

export const tokenStorage = {
  getAccess(): string | null {
    return accessTokenInMemory
  },
  getRefresh(): string | null {
    if (!isBrowser()) return null
    return localStorage.getItem(REFRESH_KEY)
  },
  set(tokens: TokenPair) {
    accessTokenInMemory = tokens.access_token
    if (isBrowser()) {
      localStorage.setItem(REFRESH_KEY, tokens.refresh_token)
    }
  },
  setAccess(token: string) {
    accessTokenInMemory = token
  },
  clear() {
    accessTokenInMemory = null
    if (isBrowser()) {
      localStorage.removeItem(REFRESH_KEY)
      // Cleanup legacy key — tokens.set trước BH-5 lưu access ở localStorage
      // dưới key 'nlh_access_token'. Remove để tránh stale value confuse.
      localStorage.removeItem('nlh_access_token')
    }
  },
  has(): boolean {
    return accessTokenInMemory !== null
  },
  /**
   * Có refresh token persistent không — main.tsx bootstrap check để quyết
   * định proactive refresh-on-load (re-mint access vào memory).
   */
  hasRefresh(): boolean {
    if (!isBrowser()) return false
    return !!localStorage.getItem(REFRESH_KEY)
  },
}
