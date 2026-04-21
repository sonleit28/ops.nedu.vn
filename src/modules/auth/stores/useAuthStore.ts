import { create } from 'zustand'
import { supabase } from '@shared/config/supabase'
import { api } from '@shared/config/api-client'
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
  logout: () => Promise<void>
}

async function fetchMockUser(): Promise<AuthUser | null> {
  try {
    const user = await api.get<AuthUser>('/auth/me')
    return user ?? null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  initialize: async () => {
    set({ isLoading: true })

    // ── Mock mode: skip Supabase, MSW trả mock user dựa vào localStorage ──
    if (IS_MOCK) {
      // Đảm bảo có mock UID trong localStorage
      if (!localStorage.getItem(MOCK_UID_KEY)) {
        localStorage.setItem(MOCK_UID_KEY, DEFAULT_MOCK_ID)
      }
      const user = await fetchMockUser()
      set({ user, isLoading: false })
      return
    }

    // ── Production: normal Supabase flow ──
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const user = await fetchMockUser()
      set({ user, isLoading: false })
    } else {
      set({ user: null, isLoading: false })
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const user = await fetchMockUser()
        set({ user })
      } else if (event === 'SIGNED_OUT') {
        set({ user: null })
      }
    })
  },

  loginWithGoogle: async () => {
    if (IS_MOCK) {
      // Mock: set UID rồi fetch user — LoginPage sẽ navigate khi user được set
      localStorage.setItem(MOCK_UID_KEY, DEFAULT_MOCK_ID)
      const user = await fetchMockUser()
      set({ user })
      return
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth-callback` },
    })
  },

  loginDev: async () => {
    // Dev bypass — chỉ dùng khi VITE_ENABLE_MOCKING=true
    localStorage.setItem(MOCK_UID_KEY, DEFAULT_MOCK_ID)
    const user = await fetchMockUser()
    set({ user })
  },

  logout: async () => {
    if (!IS_MOCK) {
      await supabase.auth.signOut()
    }
    localStorage.removeItem(MOCK_UID_KEY)
    set({ user: null })
  },
}))
