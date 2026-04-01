import { useAuthStore } from '@store/authStore';

/**
 * Custom hook that wraps authStore access for components
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  return { user, isAuthenticated, login, logout, checkAuth };
}
