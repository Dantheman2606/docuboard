// features/auth/hooks/useAuth.ts
import { useAuthStore } from '../store/authStore';
import { api } from '@/lib/api';
import { useRouter } from 'next/router';

export const useAuth = () => {
  const router = useRouter();
  const { user, currentProjectRole, isAuthenticated, login, logout, setCurrentProjectRole } = useAuthStore();

  const handleLogin = async (username: string, password: string) => {
    try {
      const userData = await api.login(username, password);
      const user: any = userData;
      login(user);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const handleSignup = async (username: string, password: string, name: string, role?: string) => {
    try {
      const userData = await api.signup(username, password, name, role);
      const user: any = userData;
      login(user);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return {
    user,
    currentProjectRole,
    isAuthenticated,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    setCurrentProjectRole,
  };
};
