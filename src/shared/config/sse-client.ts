import { env } from './env'
import { tokenStorage } from './token-storage'
import { refreshTokens } from './auth-central-client'

// SSE client dựa trên fetch + ReadableStream.
// Lý do không dùng EventSource: EventSource không set được Authorization header,
// buộc phải đưa token qua query param — rò rỉ qua server log + browser history.
// Fetch stream gửi Bearer đúng như REST, refresh token khi 401 giống api-client.

export interface SseMessage {
  id?: string
  type?: string
  data: string
}

export interface SseOptions {
  onMessage: (msg: SseMessage) => void
  onError?: (err: unknown) => void
  signal?: AbortSignal
}

// Trả về promise resolve khi stream kết thúc (server đóng hoặc abort).
// Caller dùng AbortController để dừng → cleanup trong useEffect.
export async function subscribeSse(path: string, opts: SseOptions): Promise<void> {
  const run = async (): Promise<void> => {
    const token = tokenStorage.getAccess()
    const res = await fetch(`${env.API_URL}/api${path}`, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: opts.signal,
    })

    if (res.status === 401 && tokenStorage.getRefresh()) {
      const refreshed = await refreshTokens()
      if (refreshed) return run()
    }
    if (!res.ok) throw new Error(`SSE failed: HTTP ${res.status}`)
    if (!res.body) throw new Error('SSE: no response body')

    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    // Parser theo spec text/event-stream:
    //   - Events phân tách bởi blank line (\n\n).
    //   - Mỗi event gồm nhiều line "field:value".
    //   - Comment line bắt đầu bằng ":" (Nest gửi ":ping" làm heartbeat) → ignore.
    while (true) {
      const { value, done } = await reader.read()
      if (done) return
      buffer += decoder.decode(value, { stream: true })
      let sep: number
      while ((sep = buffer.indexOf('\n\n')) !== -1) {
        const raw = buffer.slice(0, sep)
        buffer = buffer.slice(sep + 2)
        const msg = parseEvent(raw)
        if (msg) opts.onMessage(msg)
      }
    }
  }

  try {
    await run()
  } catch (err) {
    if ((err as { name?: string }).name === 'AbortError') return
    opts.onError?.(err)
    throw err
  }
}

function parseEvent(raw: string): SseMessage | null {
  let id: string | undefined
  let type: string | undefined
  const dataLines: string[] = []
  for (const line of raw.split('\n')) {
    if (!line || line.startsWith(':')) continue
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const field = line.slice(0, colon)
    // Spec: 1 space sau colon được strip.
    const value = line.slice(colon + 1).replace(/^ /, '')
    if (field === 'id') id = value
    else if (field === 'event') type = value
    else if (field === 'data') dataLines.push(value)
  }
  if (dataLines.length === 0) return null
  return { id, type, data: dataLines.join('\n') }
}
