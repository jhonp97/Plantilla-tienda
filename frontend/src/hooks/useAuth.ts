import { useAuthStore } from '@store/authStore';
import { login as loginService, register as registerService, logout as logoutService } from '@services/auth.service';

/**
 * Custom hook that wraps authStore access for components
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  
  const login = async (credentials: { email: string; password: string }) => {
    const user = await loginService(credentials);
    useAuthStore.getState().login(user);
  };
  
  const logout = async () => {
    await logoutService();
    useAuthStore.getState().logout();
  };
  
  const register = async (data: { email: string; password: string; fullName: string; nifCif: string }) => {
    const user = await registerService({
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      nifCif: data.nifCif,
    });
    useAuthStore.getState().login(user);
  };

  return { 
    user, 
    isAuthenticated, 
    isLoading,
    login, 
    logout, 
    register,
    checkAuth 
  };
}