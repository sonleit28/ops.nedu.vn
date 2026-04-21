// src/mocks/init.ts
import { env } from '@shared/config/env'

export async function enableMocking() {
  if (!env.VITE_ENABLE_MOCKING) return
  const { worker } = await import('./browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
}
