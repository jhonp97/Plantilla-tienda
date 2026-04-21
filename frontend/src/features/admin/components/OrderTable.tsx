/**
 * OrderTable - Table view with filters and sorting for order management
 */
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Order, OrderStatus } from '../../../types/order.types';
import styles from './OrderTable.module.css';

interface OrderTableProps {
  orders: Order[];
  isLoading?: boolean;
  onViewDetails: (order: Order) => void;
  onChangeStatus: (order: Order) => void;
}

const STATUS_CLASSES: Record<OrderStatus, string> = {
  PENDING: styles.statusPending,
  CONFIRMED: styles.statusConfirmed,
  PROCESSING: styles.statusProcessing,
  SHIPPED: styles.statusShipped,
  DELIVERED: styles.statusDelivered,
  CANCELLED: styles.statusCancelled,
  REFUNDED: styles.statusRefunded,
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PROCESSING: 'Procesando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
};

export function OrderTable({
  orders,
  isLoading,
  onViewDetails,
  onChangeStatus,
}: OrderTableProps) {
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'date' | 'total'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(o => o.id)));
    }
  };

  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    } else {
      return sortOrder === 'desc' ? b.total - a.total : a.total - b.total;
    }
  });

  if (isLoading) {
    return (
      <div className={styles.skeletonContainer}>
        <div className={styles.skeletonContent}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      {/* Bulk Actions Bar */}
      {selectedOrders.size > 0 && (
        <div className={styles.bulkActionsBar}>
          <span className={styles.bulkActionsText}>
            {selectedOrders.size} orden{selectedOrders.size > 1 ? 'es' : ''} seleccionad{selectedOrders.size > 1 ? 'as' : 'a'}
          </span>
          <div className={styles.bulkActionsButtons}>
            <button className={styles.bulkActionButton}>
              Marcar como Procesando
            </button>
            <button className={styles.bulkActionButton}>
              Exportar Seleccionadas
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableHeaderCell}>
                <input
                  type="checkbox"
                  checked={selectedOrders.size === orders.length && orders.length > 0}
                  onChange={handleSelectAll}
                  className={styles.checkbox}
                />
              </th>
              <th className={styles.tableHeaderCell}>
                Orden
              </th>
              <th className={styles.tableHeaderCell}>
                Cliente
              </th>
              <th className={styles.tableHeaderCell}>
                Estado
              </th>
              <th className={styles.tableHeaderCell}>
                Total
              </th>
              <th className={styles.tableHeaderCell}>
                Fecha
              </th>
              <th className={styles.tableHeaderCell}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {sortedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>
                  No se encontraron órdenes
                </td>
              </tr>
            ) : (
              sortedOrders.map((order) => (
                <tr key={order.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <input
                      type="checkbox"
                      checked={selectedOrders.has(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className={styles.checkbox}
                    />
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.orderInfo}>
                      <p className={styles.orderNumber}>#{order.orderNumber}</p>
                      <p className={styles.orderItems}>{order.items.length} productos</p>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.customerInfo}>
                      <p className={styles.customerName}>
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </p>
                      <p className={styles.customerCity}>{order.shippingAddress.city}</p>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={`${styles.statusBadge} ${STATUS_CLASSES[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <p className={styles.priceValue}>
                      ${order.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                  </td>
                  <td className={styles.tableCell}>
                    <p className={styles.dateValue}>
                      {format(parseISO(order.createdAt), 'd MMM yyyy', { locale: es })}
                    </p>
                    <p className={styles.timeValue}>
                      {format(parseISO(order.createdAt), 'HH:mm', { locale: es })}
                    </p>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.actionsCell}>
                      <button
                        onClick={() => onViewDetails(order)}
                        className={styles.actionButton}
                        title="Ver detalles"
                      >
                        <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onChangeStatus(order)}
                        className={styles.actionButtonSecondary}
                        title="Cambiar estado"
                      >
                        <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}