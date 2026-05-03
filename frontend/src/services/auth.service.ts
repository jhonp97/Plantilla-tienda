import { useAuthStore } from '@store/authStore';
import { useCartStore } from '@store/cartStore';
import { apiGet, apiPost } from './api';
import type { User } from '@store/authStore';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  nifCif: string;
}

const deps = {
  getCartId: () => useCartStore.getState().getCartId(),
  logout: () => useAuthStore.getState().logout(),
};

export async function login(credentials: LoginCredentials): Promise<User> {
  const user = await apiPost<User>('/api/auth/login', credentials, {}, deps);
  useAuthStore.getState().login(user);

  // Merge anonymous cart after login
  await useCartStore.getState().mergeCart();

  return user;
}

export async function logout(): Promise<void> {
  await apiPost<void>('/api/auth/logout', {}, {}, deps);
  useAuthStore.getState().logout();
}

export async function register(input: RegisterInput): Promise<User> {
  const user = await apiPost<User>('/api/auth/register', input, {}, deps);
  useAuthStore.getState().login(user);
  return user;
}

export async function getMe(): Promise<User | null> {
  try {
    return await apiGet<User>('/api/auth/me', {}, deps);
  } catch {
    return null;
  }
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/api/auth/forgot-password', { email }, {}, deps);
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/api/auth/reset-password', { token, newPassword }, {}, deps);
}
