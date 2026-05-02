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
  return fetch(`${env.API_URL}/api${path}`, {
    method,
    headers: buildHeaders(token, body !== undefined),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

async function request<T>(
  method: string,
  path: string,
  body: unknown,
  unwrapData: boolean,
): Promise<T | undefined> {
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

  // BE's TransformInterceptor wrap mọi response thành { data: T }.
  // Mặc định unwrap để caller nhận T trực tiếp (list, detail, KPI...).
  // Endpoint cần đọc meta ngoài data (paginated, catch-up) → dùng api.getRaw.
  // Phải check 'data' in json — KHÔNG dùng `??` vì `data: null` hợp lệ
  // (ví dụ: getPersonalProfile khi chưa có row trả về {data: null}).
  if (unwrapData) {
    if (json !== null && typeof json === 'object' && 'data' in json) {
      return (json as { data: T }).data
    }
    return json as T
  }
  return json as T
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path, undefined, true),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body, true),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body, true),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body, true),
  delete: (path: string) => request<void>('DELETE', path, undefined, true),
  // Raw: giữ nguyên JSON body (không unwrap .data). Dùng cho endpoint trả
  // { data, meta, ... } mà caller cần cả meta.
  getRaw: <T>(path: string) => request<T>('GET', path, undefined, false),
}
