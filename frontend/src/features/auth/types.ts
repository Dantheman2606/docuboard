// features/auth/types.ts

export type Role = 'owner' | 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role?: Role;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  currentProjectRole: Role | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setCurrentProjectRole: (role: Role | null) => void;
}
