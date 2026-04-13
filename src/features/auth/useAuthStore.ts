import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '../../shared/types';
import { MOCK_CURRENT_USER } from '../../constants/mock-data';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (user?: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user = MOCK_CURRENT_USER) => {
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'nedu-auth',
    }
  )
);
