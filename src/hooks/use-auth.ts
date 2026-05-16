import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';

export function useAuth() {
  const router = useRouter();
  const { user, setAuth, clearAuth } = useAuthStore();

  async function login(email: string, password: string, redirectTo?: string) {
    const data = await authApi.login({ email, password });
    setAuth(data.user, data.accessToken, data.refreshToken);
    router.push(redirectTo ?? '/clubs');
  }

  async function register(email: string, password: string, name: string, clubName: string, clubDescription?: string) {
    const data = await authApi.register({ email, password, name, clubName, clubDescription });
    setAuth(data.user, data.accessToken, data.refreshToken);
    router.push('/clubs');
  }

  async function logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) await authApi.logout(refreshToken).catch(() => {});
    clearAuth();
    router.push('/');
  }

  return { user, login, register, logout, isAuthenticated: !!user };
}
