// features/auth/hooks/useAuth.ts
import { useAuthStore } from '../store/authStore';
import { api } from '@/lib/api';
import { useRouter } from 'next/router';

export const useAuth = () => {
  const router = useRouter();
  const { user, token, currentProjectRole, isAuthenticated, login, logout, setCurrentProjectRole } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    const data = await api.login(email, password);
    login(data.user, data.token);
    return data;
  };

  const handleSignup = async (username: string, email: string, password: string, name: string, role?: string) => {
    const data = await api.signup(username, email, password, name, role);
    login(data.user, data.token);
    return data;
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return {
    user,
    token,
    currentProjectRole,
    isAuthenticated,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    setCurrentProjectRole,
  };
};
