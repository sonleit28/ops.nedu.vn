import { create } from 'zustand'
import { api, onAuthExpired } from '@shared/config/api-client'
import { tokenStorage, type TokenPair } from '@shared/config/token-storage'
import {
  redirectToGoogleLogin,
  logout as authCentralLogout,
} from '@shared/config/auth-central-client'
import type { AuthUser } from '@shared/types/auth'

const IS_MOCK = import.meta.env.VITE_ENABLE_MOCKING === 'true'
const MOCK_UID_KEY = 'mock_uid'
// consultant-01 — default dev persona
const DEFAULT_MOCK_ID = 'c3d4e5f6-a7b8-4012-9def-345678901234'

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  initialize: () => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginDev?: () => Promise<void>
  /** Called by AuthCallbackPage after parsing tokens from URL fragment. */
  acceptTokens: (tokens: TokenPair) => Promise<void>
  logout: () => Promise<void>
}

async function fetchMe(): Promise<AuthUser | null> {
  try {
    const user = await api.get<AuthUser>('/auth/me')
    return user ?? null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set, get) => {
  // When backend responds 401 and refresh also fails, kick user back to login state.
  onAuthExpired(() => {
    tokenStorage.clear()
    set({ user: null })
  })

  return {
    user: null,
    isLoading: true,

    initialize: async () => {
      set({ isLoading: true })

      // ── Mock mode: skip auth-central; MSW returns mock /auth/me by localStorage UID ──
      if (IS_MOCK) {
        if (!localStorage.getItem(MOCK_UID_KEY)) {
          localStorage.setItem(MOCK_UID_KEY, DEFAULT_MOCK_ID)
        }
        const user = await fetchMe()
        set({ user, isLoading: false })
        return
      }

      // ── Production: check for existing tokens, fetch user ──
      if (!tokenStorage.has()) {
        set({ user: null, isLoading: false })
        return
      }
      const user = await fetchMe()
      set({ user, isLoading: false })
    },

    loginWithGoogle: async () => {
      if (IS_MOCK) {
        localStorage.setItem(MOCK_UID_KEY, DEFAULT_MOCK_ID)
        const user = await fetchMe()
        set({ user })
        return
      }
      // Redirects the browser — state after this won't matter.
      redirectToGoogleLogin()
    },

    loginDev: async () => {
      localStorage.setItem(MOCK_UID_KEY, DEFAULT_MOCK_ID)
      const user = await fetchMe()
      set({ user })
    },

    acceptTokens: async (tokens) => {
      tokenStorage.set(tokens)
      const user = await fetchMe()
      set({ user })
    },

    logout: async () => {
      if (IS_MOCK) {
        localStorage.removeItem(MOCK_UID_KEY)
        set({ user: null })
        return
      }
      await authCentralLogout()
      set({ user: null })
      // reference get() to keep TS happy if unused (tree-shakeable)
      void get
    },
  }
})
