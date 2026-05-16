import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';

export function useAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setAuth, clearAuth } = useAuthStore();

  async function login(email: string, password: string) {
    const data = await authApi.login({ email, password });
    setAuth(data.user, data.accessToken, data.refreshToken);
    const from = searchParams?.get('from') ?? '/clubs';
    router.push(from);
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
