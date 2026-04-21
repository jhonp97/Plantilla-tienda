import { useEffect, useCallback } from 'react';
import sharedStyles from '../../styles/AdminShared.module.css';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'danger',
}: ConfirmModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    },
    [onCancel]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const confirmButtonClass = () => {
    switch (variant) {
      case 'danger':
        return styles.confirmButtonDanger;
      case 'warning':
        return styles.confirmButtonWarning;
      case 'info':
      default:
        return styles.confirmButtonPrimary;
    }
  };

  return (
    <div className={sharedStyles.modalOverlay} onClick={handleOverlayClick}>
      <div className={sharedStyles.modal} role="dialog" aria-modal="true">
        <div className={sharedStyles.modalHeader}>
          <h3 className={sharedStyles.modalTitle}>{title}</h3>
        </div>
        <div className={sharedStyles.modalBody}>
          <p className={sharedStyles.modalBodyText}>{message}</p>
          <div className={sharedStyles.modalFooter}>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className={sharedStyles.cancelButton}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`${styles.confirmButton} ${confirmButtonClass()}`}
            >
              {isLoading ? 'Procesando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
