import { useCallback } from 'react';
import { useToastStore } from '../store/toastStore';
import type { ToastType } from '../store/toastStore';

/**
 * useToast - Convenience hook for showing toast notifications.
 *
 * @returns {Object} Methods to show toasts: success, error, warning, info, removeToast
 */
export function useToast() {
  const { success, error, warning, info, removeToast } = useToastStore();

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration?: number) => {
      switch (type) {
        case 'success':
          return success(message, duration);
        case 'error':
          return error(message, duration);
        case 'warning':
          return warning(message, duration);
        case 'info':
        default:
          return info(message, duration);
      }
    },
    [success, error, warning, info]
  );

  return {
    success,
    error,
    warning,
    info,
    showToast,
    removeToast,
  };
}
