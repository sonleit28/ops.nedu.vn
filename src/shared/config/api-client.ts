import { env } from './env'
import { tokenStorage } from './token-storage'
import { refreshTokens } from './auth-central-client'

export class ApiError extends Error {
  status: number
  code?: string
  details?: Record<string, unknown>

  constructor(
    status: number,
    message: string,
    code?: string,
    details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

type AuthExpiredListener = () => void
const authExpiredListeners: AuthExpiredListener[] = []

export function onAuthExpired(fn: AuthExpiredListener): () => void {
  authExpiredListeners.push(fn)
  return () => {
    const i = authExpiredListeners.indexOf(fn)
    if (i >= 0) authExpiredListeners.splice(i, 1)
  }
}

function notifyAuthExpired() {
  authExpiredListeners.forEach((fn) => {
    try { fn() } catch { /* ignore */ }
  })
}

function buildHeaders(token: string | null, hasBody: boolean): Record<string, string> {
  const headers: Record<string, string> = {}
  if (hasBody) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function doFetch(method: string, path: string, body: unknown, token: string | null) {
  return fetch(`${env.VITE_API_URL}/api${path}`, {
    method,
    headers: buildHeaders(token, body !== undefined),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T | undefined> {
  let access = tokenStorage.getAccess()
  let res = await doFetch(method, path, body, access)

  // On 401, try a single refresh-and-retry cycle.
  if (res.status === 401 && tokenStorage.getRefresh()) {
    const newAccess = await refreshTokens()
    if (newAccess) {
      access = newAccess
      res = await doFetch(method, path, body, access)
    }
  }

  if (res.status === 401) {
    notifyAuthExpired()
  }

  if (res.status === 204) return undefined

  const text = await res.text()
  const json = text ? JSON.parse(text) : null

  if (!res.ok) {
    throw new ApiError(
      res.status,
      json?.message ?? 'Unknown error',
      json?.code,
      json?.details,
    )
  }

  return (json?.data ?? json) as T
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: (path: string) => request<void>('DELETE', path),
}
