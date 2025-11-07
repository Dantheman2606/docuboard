// features/auth/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, Role } from '../types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      currentProjectRole: null,
      isAuthenticated: false,

      login: (user: User) => {
        set({ 
          user, 
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({ 
          user: null, 
          currentProjectRole: null,
          isAuthenticated: false 
        });
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
      },

      setCurrentProjectRole: (role: Role | null) => {
        set({ currentProjectRole: role });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
