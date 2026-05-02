// features/auth/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, User, Role } from '../types';

/** All localStorage keys that hold user-session data — wiped on logout. */
const SESSION_STORAGE_KEYS = [
  'auth-storage',    // JWT token + user info (this store)
  'kanban-storage',  // cached kanban boards (contain project data)
  'document-storage', // cached documents (contain project data)
];

const clearAllSessionStorage = () => {
  if (typeof window === 'undefined') return;
  SESSION_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      currentProjectRole: null,
      isAuthenticated: false,

      login: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        // 1. Reset Zustand state to initial values
        set({
          user: null,
          token: null,
          currentProjectRole: null,
          isAuthenticated: false,
        });

        // 2. Completely remove all session-related localStorage keys
        //    (Zustand persist would write back null values, but we want a clean wipe)
        clearAllSessionStorage();
      },

      setCurrentProjectRole: (role: Role | null) => {
        set({ currentProjectRole: role });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
