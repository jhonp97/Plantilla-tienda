/**
 * OrderHistoryPage - Customer order history listing
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrderStore } from '../../../store/orderStore';
import type { OrderStatus, PaymentStatus, ShippingStatus } from '../../../types/order.types';
import styles from './OrderHistoryPage.module.css';

const STATUS_FILTERS: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'PROCESSING', label: 'Procesando' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

export default function OrderHistoryPage() {
  const {
    orders,
    filters,
    page,
    totalPages,
    total,
    isLoading,
    error,
    fetchOrders,
    setFilters,
    setPage,
  } = useOrderStore();

  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusFilterChange = (status: OrderStatus | '') => {
    setStatusFilter(status);
    setFilters(status ? { status } : {});
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
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

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <svg className={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className={styles.errorTitle}>Error</h2>
            <p className={styles.errorText}>{error}</p>
            <button
              onClick={() => fetchOrders()}
              className={styles.retryButton}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>
          Mis Pedidos
        </h1>

        {/* Filters */}
        <div className={styles.filtersSection}>
          <div className={styles.filtersRow}>
            <div className={styles.filterGroup}>
              <label htmlFor="statusFilter" className={styles.filterLabel}>
                Filtrar por estado
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value as OrderStatus | '')}
                className={styles.filterSelect}
              >
                {STATUS_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className={styles.skeletonList}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonLine1} />
                <div className={styles.skeletonLine2} />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className={styles.emptyTitle}>
              No tienes pedidos aún
            </h2>
            <p className={styles.emptyText}>
              Cuando realices tu primera compra, podrás ver el historial aquí
            </p>
            <Link
              to="/products"
              className={styles.emptyButton}
            >
              Ver Productos
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.ordersList}>
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={styles.orderCard}
                >
                  {/* Order Header */}
                  <div className={styles.orderHeader}>
                    <div className={styles.orderHeaderLeft}>
                      <h3 className={styles.orderNumber}>
                        Pedido #{order.orderNumber}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className={styles.orderHeaderRight}>
                      <p className={styles.orderTotal}>
                        ${order.total.toFixed(2)}
                      </p>
                      <p className={styles.orderItemsCount}>
                        {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                      </p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className={styles.itemsPreview}>
                    {order.items.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className={styles.itemThumb}
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                          />
                        ) : (
                          <div className={styles.itemThumbPlaceholder}>
                            <svg className={styles.iconMd} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className={styles.moreItemsThumb}>
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>

                  {/* View Details Link */}
                  <Link
                    to={`/orders/${order.id}`}
                    className={styles.viewDetailsLink}
                  >
                    Ver Detalles
                    <svg className={`${styles.iconSm} ${styles.iconMarginLeft}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className={styles.paginationButton}
                >
                  Anterior
                </button>
                <span className={styles.paginationText}>
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className={styles.paginationButton}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}