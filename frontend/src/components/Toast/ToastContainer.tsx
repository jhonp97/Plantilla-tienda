import { createPortal } from 'react-dom';
import { useToastStore } from '../../store/toastStore';
import { ToastItem } from './Toast';
import styles from './Toast.module.css';

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className={styles.container} aria-label="Notificaciones">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body
  );
}
