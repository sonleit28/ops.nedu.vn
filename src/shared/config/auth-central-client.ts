import { env } from './env'
import { tokenStorage, type TokenPair } from './token-storage'

export interface LoginResponse extends TokenPair {
  token_type: 'Bearer'
  user: {
    id: string
    person_id: string
    email: string
    full_name: string
    avatar_url?: string | null
  }
}

export interface RefreshResponse extends TokenPair {
  token_type: 'Bearer'
}

class AuthCentralError extends Error {
  status: number
  code?: string
  constructor(status: number, message: string, code?: string) {
    super(message)
    this.name = 'AuthCentralError'
    this.status = status
    this.code = code
  }
}

function baseUrl(): string {
  const url = env.VITE_AUTH_CENTRAL_URL
  if (!url) throw new Error('VITE_AUTH_CENTRAL_URL is not configured')
  return url.replace(/\/$/, '')
}

async function call<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  })
  const text = await res.text()
  const body = text ? JSON.parse(text) : null
  if (!res.ok) {
    throw new AuthCentralError(
      res.status,
      body?.message ?? body?.error ?? `Auth request failed (${res.status})`,
      body?.code,
    )
  }
  return body as T
}

/**
 * Redirect user to Google OAuth flow via auth-central.
 * After consent, auth-central redirects back with tokens in URL fragment:
 *   {origin}/auth-callback#access_token=...&refresh_token=...&token_type=Bearer
 */
export function redirectToGoogleLogin() {
  const returnTo = `${window.location.origin}/auth-callback`
  window.location.href = `${baseUrl()}/auth/oauth/google?return_to=${encodeURIComponent(returnTo)}`
}

/** Email + password login (currently unused by UI; kept for completeness). */
export async function loginWithPassword(email: string, password: string): Promise<LoginResponse> {
  const res = await call<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  tokenStorage.set({ access_token: res.access_token, refresh_token: res.refresh_token })
  return res
}

/**
 * Rotate tokens. Returns new access token or null if refresh fails
 * (user must re-login). Invalidates storage on failure.
 */
let refreshInflight: Promise<string | null> | null = null

export function refreshTokens(): Promise<string | null> {
  if (refreshInflight) return refreshInflight
  refreshInflight = (async () => {
    try {
      const refresh_token = tokenStorage.getRefresh()
      if (!refresh_token) return null
      const res = await call<RefreshResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token }),
      })
      tokenStorage.set({ access_token: res.access_token, refresh_token: res.refresh_token })
      return res.access_token
    } catch {
      tokenStorage.clear()
      return null
    } finally {
      refreshInflight = null
    }
  })()
  return refreshInflight
}

/** Revoke refresh token on auth-central, then clear local storage. */
export async function logout(): Promise<void> {
  const refresh_token = tokenStorage.getRefresh()
  try {
    await call<{ success: boolean }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify(refresh_token ? { refresh_token } : {}),
    })
  } catch {
    /* ignore — we clear locally either way */
  }
  tokenStorage.clear()
}

export interface AuthCentralMe {
  id: string
  person_id: string
  email: string
  provider: string
  full_name: string
  avatar_url: string | null
}

/** Fetch the current user directly from auth-central. */
export async function fetchAuthCentralMe(): Promise<AuthCentralMe> {
  const access = tokenStorage.getAccess()
  if (!access) throw new AuthCentralError(401, 'No access token')
  return call<AuthCentralMe>('/auth/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${access}` },
  })
}

export { AuthCentralError }
