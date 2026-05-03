import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

const MAX_TOASTS = 5;
const DEFAULT_DURATION = 5000;

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
}

let toastCounter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    const newToast: Toast = { ...toast, id };

    set((state) => {
      const updatedToasts = [...state.toasts, newToast];
      // Cap at MAX_TOASTS — dismiss oldest
      if (updatedToasts.length > MAX_TOASTS) {
        updatedToasts.shift();
      }
      return { toasts: updatedToasts };
    });

    // Auto-dismiss
    const duration = toast.duration ?? DEFAULT_DURATION;
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  success: (message, duration) => {
    return get().addToast({ message, type: 'success', duration });
  },

  error: (message, duration) => {
    return get().addToast({ message, type: 'error', duration });
  },

  warning: (message, duration) => {
    return get().addToast({ message, type: 'warning', duration });
  },

  info: (message, duration) => {
    return get().addToast({ message, type: 'info', duration });
  },
}));
