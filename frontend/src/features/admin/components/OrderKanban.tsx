/**
 * OrderKanban - Kanban view for order management with drag-and-drop
 */
import { useState, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Order, OrderStatus } from '../../../types/order.types';
import styles from './OrderKanban.module.css';

interface OrderKanbanProps {
  orders: Order[];
  isLoading?: boolean;
  onViewDetails: (order: Order) => void;
  onChangeStatus: (order: Order, newStatus: OrderStatus) => void;
}

const COLUMNS: { status: OrderStatus; label: string; headerClass: string }[] = [
  { status: 'PENDING', label: 'Pendiente', headerClass: styles.columnHeaderYellow },
  { status: 'CONFIRMED', label: 'Confirmado', headerClass: styles.columnHeaderBlue },
  { status: 'PROCESSING', label: 'Procesando', headerClass: styles.columnHeaderPurple },
  { status: 'SHIPPED', label: 'Enviado', headerClass: styles.columnHeaderIndigo },
  { status: 'DELIVERED', label: 'Entregado', headerClass: styles.columnHeaderGreen },
];

function OrderCard({ order, onViewDetails, onDragStart, onDragEnd }: {
  order: Order;
  onViewDetails: (order: Order) => void;
  onDragStart: (e: React.DragEvent, orderId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, order.id)}
      onDragEnd={onDragEnd}
      onClick={() => onViewDetails(order)}
      className={styles.orderCard}
    >
      <div className={styles.orderCardHeader}>
        <p className={styles.orderNumber}>#{order.orderNumber}</p>
        <span className={styles.orderDate}>
          {format(parseISO(order.createdAt), 'd MMM', { locale: es })}
        </span>
      </div>
      <p className={styles.orderCustomer}>
        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
      </p>
      <div className={styles.orderFooter}>
        <p className={styles.orderTotal}>
          ${order.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </p>
        <p className={styles.orderItems}>{order.items.length} items</p>
      </div>
    </div>
  );
}

export function OrderKanban({
  orders,
  isLoading,
  onViewDetails,
  onChangeStatus,
}: OrderKanbanProps) {
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<OrderStatus | null>(null);
  const dragCounter = useRef<Record<OrderStatus, number>>({
    PENDING: 0,
    CONFIRMED: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
    REFUNDED: 0,
  });

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', orderId);
  };

  const handleDragEnd = () => {
    setDraggedOrderId(null);
    setDragOverColumn(null);
    dragCounter.current = {
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      REFUNDED: 0,
    };
  };

  const handleDragEnter = (status: OrderStatus) => {
    dragCounter.current[status]++;
    setDragOverColumn(status);
  };

  const handleDragLeave = (status: OrderStatus) => {
    dragCounter.current[status]--;
    if (dragCounter.current[status] === 0) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, newStatus: OrderStatus) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('text/plain');

    if (orderId && draggedOrderId) {
      const order = orders.find(o => o.id === orderId);
      if (order && order.status !== newStatus) {
        onChangeStatus(order, newStatus);
      }
    }

    setDraggedOrderId(null);
    setDragOverColumn(null);
    dragCounter.current = {
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      REFUNDED: 0,
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (isLoading) {
    return (
      <div className={styles.skeletonContainer}>
        {COLUMNS.map((col) => (
          <div key={col.status} className={styles.skeletonColumn}>
            <div className={styles.skeletonCard}>
              <div className={styles.skeletonHeader} />
              <div className={styles.skeletonItemList}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.skeletonItem} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.kanbanContainer}>
      {COLUMNS.map((column) => {
        const columnOrders = orders.filter((o) => o.status === column.status);
        const isDragOver = dragOverColumn === column.status;

        return (
          <div
            key={column.status}
            className={`${styles.column} ${isDragOver ? styles.columnDragOver : styles.columnDefault}`}
            onDragEnter={() => handleDragEnter(column.status)}
            onDragLeave={() => handleDragLeave(column.status)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            {/* Column Header */}
            <div className={`${styles.columnHeader} ${column.headerClass}`}>
              <div className={styles.columnHeaderContent}>
                <h3 className={styles.columnTitle}>{column.label}</h3>
                <span className={styles.columnCount}>
                  {columnOrders.length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className={styles.columnContent}>
              {columnOrders.length === 0 ? (
                <div className={styles.emptyColumn}>
                  Sin órdenes
                </div>
              ) : (
                columnOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onViewDetails={onViewDetails}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}