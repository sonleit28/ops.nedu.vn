// src/mocks/config.ts
import { HttpResponse } from 'msw'
import { MOCK_PERSONS } from './data/persons'

/** Key dùng để lưu mock user ID trong localStorage (dev only) */
export const MOCK_UID_KEY = 'mock_uid'

/** Default person khi chưa chọn: consultant-01 */
export const DEFAULT_MOCK_ID = MOCK_PERSONS[2].id

export async function getCurrentMockUserId(): Promise<string | null> {
  // In mock mode we drive /auth/me off localStorage; in live mode MSW should
  // be disabled (VITE_ENABLE_MOCKING=false) and real auth-central is used.
  return localStorage.getItem(MOCK_UID_KEY) ?? DEFAULT_MOCK_ID
}

export async function getCurrentMockPerson() {
  const id = await getCurrentMockUserId()
  return id ? MOCK_PERSONS.find(p => p.id === id) ?? null : null
}

export function unauthorized() {
  return HttpResponse.json(
    { statusCode: 401, message: 'Unauthorized', error: 'Unauthorized' },
    { status: 401 },
  )
}

export function forbidden(msg = 'Forbidden') {
  return HttpResponse.json(
    { statusCode: 403, message: msg, error: 'Forbidden' },
    { status: 403 },
  )
}

export function notFound(msg = 'Not found') {
  return HttpResponse.json(
    { statusCode: 404, message: msg, error: 'Not Found' },
    { status: 404 },
  )
}

export function badRequest(messages: string[]) {
  return HttpResponse.json(
    { statusCode: 400, message: messages, error: 'Bad Request' },
    { status: 400 },
  )
}
