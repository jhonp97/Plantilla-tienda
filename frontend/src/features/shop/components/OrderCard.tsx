/**
 * OrderCard - Reusable order card component for listings
 */
import { Link } from 'react-router-dom';
import type { Order, OrderStatus } from '../../../types/order.types';
import styles from './OrderCard.module.css';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: OrderStatus) => {
    const statusClasses: Record<OrderStatus, string> = {
      PENDING: styles.statusPending,
      CONFIRMED: styles.statusConfirmed,
      PROCESSING: styles.statusProcessing,
      SHIPPED: styles.statusShipped,
      DELIVERED: styles.statusDelivered,
      CANCELLED: styles.statusCancelled,
      REFUNDED: styles.statusRefunded,
    };

    const labels: Record<OrderStatus, string> = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmado',
      PROCESSING: 'Procesando',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregado',
      CANCELLED: 'Cancelado',
      REFUNDED: 'Reembolsado',
    };

    return (
      <span className={`${styles.statusBadge} ${statusClasses[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className={styles.orderCard}>
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <div className={styles.orderInfo}>
          <h3 className={styles.orderNumber}>
            Pedido #{order.orderNumber}
          </h3>
          <p className={styles.orderDate}>
            {formatDate(order.createdAt)}
          </p>
        </div>
        {getStatusBadge(order.status)}
      </div>

      {/* Order Preview */}
      <div className={styles.orderPreview}>
        {order.items.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className={styles.orderItemThumb}
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
              />
            ) : (
              <div className={styles.orderItemPlaceholder}>
                  <svg className={styles.iconSm} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        ))}
        {order.items.length > 3 && (
          <div className={styles.moreItems}>
            +{order.items.length - 3}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className={styles.cardFooter}>
        <div className={styles.orderTotalInfo}>
          <p className={styles.orderTotalLabel}>Total</p>
          <p className={styles.orderTotalValue}>
            ${order.total.toFixed(2)}
          </p>
        </div>
        <Link
          to={`/orders/${order.id}`}
          className={styles.viewDetailsButton}
        >
          Ver Detalles
        </Link>
      </div>
    </div>
  );
}