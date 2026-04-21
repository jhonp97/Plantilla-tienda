/**
 * OrderDetailPage - Detailed order view for customers
 */
import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../../store/orderStore';
import type { OrderStatus, PaymentStatus, ShippingStatus } from '../../../types/order.types';
import styles from './OrderDetailPage.module.css';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedOrder, isLoading, error, fetchOrder, clearError } = useOrderStore();

  useEffect(() => {
    if (id) {
      fetchOrder(id);
    }
  }, [id, fetchOrder]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const statusClasses: Record<PaymentStatus, string> = {
      PENDING: styles.paymentPending,
      PAID: styles.paymentPaid,
      FAILED: styles.paymentFailed,
      REFUNDED: styles.paymentRefunded,
      PARTIALLY_REFUNDED: styles.paymentPartial,
    };

    const labels: Record<PaymentStatus, string> = {
      PENDING: 'Pendiente',
      PAID: 'Pagado',
      FAILED: 'Fallido',
      REFUNDED: 'Reembolsado',
      PARTIALLY_REFUNDED: 'Parcialmente Reembolsado',
    };

    return (
      <span className={`${styles.paymentBadge} ${statusClasses[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.skeletonContainer}>
        <div className={styles.container}>
          <div className={styles.skeletonCard}>
            <div className={styles.skeletonLine1} />
            <div className={styles.skeletonLine2} />
            <div className={styles.skeletonLine3} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <svg className={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className={styles.errorTitle}>Error</h2>
            <p className={styles.errorText}>{error}</p>
            <div className={styles.errorActions}>
              <button
                onClick={() => navigate('/orders')}
                className={styles.backButton}
              >
                Volver a Pedidos
              </button>
              <button
                onClick={() => id && fetchOrder(id)}
                className={styles.retryButton}
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className={styles.notFoundContainer}>
        <div className={styles.container}>
          <div className={styles.notFoundCard}>
            <p className={styles.notFoundText}>Pedido no encontrado</p>
            <Link
              to="/orders"
              className={styles.notFoundLink}
            >
              Volver a Pedidos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const order = selectedOrder;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        {/* Back Link */}
        <Link
          to="/orders"
          className={styles.backLink}
        >
          <svg className={`${styles.iconSm} ${styles.iconMarginRight}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a Mis Pedidos
        </Link>

        {/* Order Header */}
        <div className={styles.orderHeader}>
          <div className={styles.orderHeaderTop}>
            <div>
              <h1 className={styles.orderTitle}>
                Pedido #{order.orderNumber}
              </h1>
              <p className={styles.orderDate}>
                Realizado el {formatDate(order.createdAt)}
              </p>
            </div>
            <div className={styles.orderBadges}>
              {getStatusBadge(order.status)}
              {getPaymentStatusBadge(order.paymentStatus)}
            </div>
          </div>
        </div>

        <div className={styles.orderGrid}>
          {/* Order Items */}
          <div className={styles.orderItems}>
            <div className={styles.orderItemsCard}>
              <h2 className={styles.orderItemsTitle}>
                Productos
              </h2>
              <div className={styles.orderItemsList}>
                {order.items.map((item) => (
                  <div key={item.id} className={styles.orderItem}>
                    <div className={styles.orderItemImage}>
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                        />
                      ) : (
                        <div className={styles.orderItemImagePlaceholder}>
                          <svg className={styles.iconLg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className={styles.orderItemInfo}>
                      <h3 className={styles.orderItemName}>
                        {item.name}
                      </h3>
                      <p className={styles.orderItemMeta}>
                        Cantidad: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className={styles.orderItemPrice}>
                      <p className={styles.orderItemTotal}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className={styles.shippingCard}>
              <h2 className={styles.shippingTitle}>
                Dirección de Envío
              </h2>
              <div className={styles.shippingAddress}>
                <p className={styles.shippingName}>
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && (
                  <p>{order.shippingAddress.address2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className={styles.shippingPhone}>Tel: {order.shippingAddress.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className={styles.orderSummary}>
            <div className={styles.orderSummaryCard}>
              <h2 className={styles.summaryTitle}>
                Resumen del Pedido
              </h2>

              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Subtotal</span>
                  <span className={styles.summaryValue}>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Envío</span>
                  <span className={styles.summaryValue}>
                    {order.shippingCost === 0 ? (
                      <span className={styles.summaryFreeShipping}>Gratis</span>
                    ) : (
                      `$${order.shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Impuestos</span>
                  <span className={styles.summaryValue}>${order.tax.toFixed(2)}</span>
                </div>
                <div className={styles.summaryTotal}>
                  <span className={styles.summaryTotalLabel}>Total</span>
                  <span className={styles.summaryTotalValue}>
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Info */}
              {order.paymentIntentId && (
                <div className={styles.paymentInfo}>
                  <p className={styles.paymentIdLabel}>ID de Pago:</p>
                  <p className={styles.paymentId}>
                    {order.paymentIntentId}
                  </p>
                </div>
              )}

              {/* Order Notes */}
              {order.notes && (
                <div className={styles.orderNotes}>
                  <p className={styles.notesLabel}>Notas:</p>
                  <p className={styles.notesText}>{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}