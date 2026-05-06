import styles from './StatusPill.module.css';

export type PillStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'SHIPPED';

export interface StatusPillProps {
  /** Order/invoice status */
  status: PillStatus;
  /** Optional override label. Defaults to status string */
  label?: string;
}

const STATUS_LABELS: Record<PillStatus, string> = {
  PENDING: 'Pendiente',
  PROCESSING: 'Procesando',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  SHIPPED: 'Enviado',
};

/**
 * StatusPill — Compact pill badge for admin order/invoice status.
 * Color-coded by status variant. Pill shape via --radius-full.
 */
export function StatusPill({ status, label }: StatusPillProps) {
  const statusClass = status.toLowerCase() as keyof typeof styles;
  const pillClass = [
    styles.pill,
    styles[statusClass] || styles.pending,
  ].join(' ');

  return (
    <span
      className={pillClass}
      aria-label={`Estado: ${label || STATUS_LABELS[status] || status}`}
    >
      {label || STATUS_LABELS[status] || status}
    </span>
  );
}

export default StatusPill;
