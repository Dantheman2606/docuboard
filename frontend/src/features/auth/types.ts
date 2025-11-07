// features/auth/types.ts

export type Role = 'owner' | 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  username: string;
  name: string;
  role?: Role; // Global role (deprecated, use project-specific roles)
}

export interface AuthState {
  user: User | null;
  currentProjectRole: Role | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setCurrentProjectRole: (role: Role | null) => void;
}
