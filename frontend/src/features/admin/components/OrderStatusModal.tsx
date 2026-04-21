/**
 * OrderStatusModal - Modal to change order status
 */
import { useState } from 'react';
import type { OrderStatus } from '../../../types/order.types';
import styles from './OrderStatusModal.module.css';

interface OrderStatusModalProps {
  isOpen: boolean;
  currentStatus: OrderStatus;
  orderNumber: string;
  onConfirm: (newStatus: OrderStatus) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const STATUS_OPTIONS: { value: OrderStatus; label: string; colorClass: string }[] = [
  { value: 'PENDING', label: 'Pendiente', colorClass: styles.statusPending },
  { value: 'CONFIRMED', label: 'Confirmado', colorClass: styles.statusConfirmed },
  { value: 'PROCESSING', label: 'Procesando', colorClass: styles.statusProcessing },
  { value: 'SHIPPED', label: 'Enviado', colorClass: styles.statusShipped },
  { value: 'DELIVERED', label: 'Entregado', colorClass: styles.statusDelivered },
  { value: 'CANCELLED', label: 'Cancelado', colorClass: styles.statusCancelled },
  { value: 'REFUNDED', label: 'Reembolsado', colorClass: styles.statusRefunded },
];

export function OrderStatusModal({
  isOpen,
  currentStatus,
  orderNumber,
  onConfirm,
  onCancel,
  isLoading,
}: OrderStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus);

  if (!isOpen) return null;

  const currentStatusObj = STATUS_OPTIONS.find(s => s.value === currentStatus);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Cambiar Estado de Orden</h3>
          <p className={styles.modalSubtitle}>Orden #{orderNumber}</p>
        </div>

        {/* Current Status */}
        <div className={styles.currentStatusSection}>
          <p className={styles.currentStatusLabel}>Estado Actual</p>
          <span className={`${styles.statusBadge} ${currentStatusObj?.colorClass}`}>
            {currentStatusObj?.label || currentStatus}
          </span>
        </div>

        {/* Status Options */}
        <div className={styles.statusOptionsSection}>
          <p className={styles.statusOptionsLabel}>Seleccionar Nuevo Estado</p>
          <div className={styles.statusOptionsGrid}>
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status.value}
                onClick={() => setSelectedStatus(status.value)}
                disabled={status.value === currentStatus}
                className={`${styles.statusButton} ${
                  selectedStatus === status.value
                    ? `${status.colorClass} ${styles.statusButtonSelected}`
                    : ''
                } ${status.value === currentStatus ? styles.statusButtonDisabled : ''}`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.modalActions}>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className={styles.cancelButton}
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(selectedStatus)}
            disabled={selectedStatus === currentStatus || isLoading}
            className={styles.confirmButton}
          >
            {isLoading ? 'Guardando...' : 'Confirmar Cambio'}
          </button>
        </div>
      </div>
    </div>
  );
}