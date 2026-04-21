/**
 * OrderManagementPage - Order management with Kanban and Table views
 */
import { useEffect, useState } from 'react';
import { useOrderStore } from '../../../store/orderStore';
import { OrderTable } from '../components/OrderTable';
import { OrderKanban } from '../components/OrderKanban';
import { OrderStatusModal } from '../components/OrderStatusModal';
import { BaseModal } from '../components/shared/BaseModal';
import type { Order, OrderStatus, OrderFilters } from '../../../types/order.types';
import styles from './OrderManagementPage.module.css';

type ViewMode = 'kanban' | 'table';

export default function OrderManagementPage() {
  const { orders, isLoading, error, fetchOrders, setFilters } = useOrderStore();
  
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filters, setLocalFilters] = useState<OrderFilters>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [orderDetailsModal, setOrderDetailsModal] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders(filters);
  }, [fetchOrders, filters]);

  const handleViewDetails = (order: Order) => {
    setOrderDetailsModal(order);
  };

  const handleChangeStatusClick = (order: Order) => {
    setSelectedOrder(order);
    setStatusModalOpen(true);
  };

  const handleStatusConfirm = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    
    setUpdatingOrderId(selectedOrder.id);
    try {
      // In a real app, this would call an API to update the status
      // For now, we'll just close the modal
      console.log('Updating order', selectedOrder.id, 'to status', newStatus);
      setStatusModalOpen(false);
      setSelectedOrder(null);
      // Refresh orders
      fetchOrders(filters);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleStatusChangeFromKanban = (order: Order, newStatus: OrderStatus) => {
    setSelectedOrder(order);
    setStatusModalOpen(true);
  };

  const handleFilterChange = (key: keyof OrderFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };

  // Helper to get status badge class
  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return styles.statusPending;
      case 'CONFIRMED':
        return styles.statusConfirmed;
      case 'PROCESSING':
        return styles.statusProcessing;
      case 'SHIPPED':
        return styles.statusShipped;
      case 'DELIVERED':
        return styles.statusDelivered;
      case 'CANCELLED':
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Gestión de Órdenes</h1>
          <p className={styles.pageSubtitle}>Administra y rastrea todas las órdenes</p>
        </div>
        
        {/* View Toggle */}
        <div className={styles.viewToggle}>
          <button
            onClick={() => setViewMode('table')}
            className={`${styles.viewToggleButton} ${
              viewMode === 'table'
                ? styles.viewToggleButtonActive
                : styles.viewToggleButtonInactive
            }`}
          >
            <svg className={styles.viewToggleIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Tabla
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`${styles.viewToggleButton} ${
              viewMode === 'kanban'
                ? styles.viewToggleButtonActive
                : styles.viewToggleButtonInactive
            }`}
          >
            <svg className={styles.viewToggleIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Kanban
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.filtersRow}>
          <div className={styles.filterInput}>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className={styles.filterInput}
            />
          </div>
          <div className={styles.filterInput}>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className={styles.filterInput}
            />
          </div>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="PROCESSING">Procesando</option>
            <option value="SHIPPED">Enviado</option>
            <option value="DELIVERED">Entregado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
          <select
            value={filters.paymentStatus || ''}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Todos los pagos</option>
            <option value="PENDING">Pendiente</option>
            <option value="PAID">Pagado</option>
            <option value="FAILED">Fallido</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      {error && (
        <div className={styles.errorAlert}>
          <p>Error: {error}</p>
          <button onClick={() => fetchOrders(filters)} className={styles.errorRetryLink}>
            Reintentar
          </button>
        </div>
      )}

      {viewMode === 'kanban' ? (
        <OrderKanban
          orders={orders}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          onChangeStatus={handleStatusChangeFromKanban}
        />
      ) : (
        <OrderTable
          orders={orders}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          onChangeStatus={handleChangeStatusClick}
        />
      )}

      {/* Status Modal */}
      {selectedOrder && (
        <OrderStatusModal
          isOpen={statusModalOpen}
          currentStatus={selectedOrder.status}
          orderNumber={selectedOrder.orderNumber}
          onConfirm={handleStatusConfirm}
          onCancel={() => {
            setStatusModalOpen(false);
            setSelectedOrder(null);
          }}
          isLoading={!!updatingOrderId}
        />
      )}

      {/* Order Details Modal */}
      <BaseModal
        isOpen={!!orderDetailsModal}
        onClose={() => setOrderDetailsModal(null)}
        maxWidth="42rem"
      >
        {orderDetailsModal && (
          <div>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>
                  Orden #{orderDetailsModal.orderNumber}
                </h3>
                <p className={styles.modalSubtitle}>
                  {new Date(orderDetailsModal.createdAt).toLocaleDateString('es-AR')}
                </p>
              </div>
              <button
                onClick={() => setOrderDetailsModal(null)}
                className={styles.modalCloseButton}
              >
                <svg className={styles.modalCloseIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Status */}
              <div className={styles.orderStatusRow}>
                <span className={styles.orderStatusLabel}>Estado:</span>
                <span className={`${styles.statusBadge} ${getStatusBadgeClass(orderDetailsModal.status)}`}>
                  {orderDetailsModal.status}
                </span>
              </div>

              {/* Shipping Address */}
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Dirección de Envío</h4>
                <p className={styles.sectionText}>
                  {orderDetailsModal.shippingAddress.firstName} {orderDetailsModal.shippingAddress.lastName}<br />
                  {orderDetailsModal.shippingAddress.address1}<br />
                  {orderDetailsModal.shippingAddress.city}, {orderDetailsModal.shippingAddress.state}<br />
                  {orderDetailsModal.shippingAddress.postalCode}, {orderDetailsModal.shippingAddress.country}
                </p>
              </div>

              {/* Items */}
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Productos</h4>
                <div className={styles.orderItems}>
                  {orderDetailsModal.items.map((item) => (
                    <div key={item.id} className={styles.orderItem}>
                      <div className={styles.orderItemImage}>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className={styles.orderItemImageImg} />
                        ) : (
                          <div className={styles.orderItemImagePlaceholder}>
                            <svg className={styles.orderItemImageIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className={styles.orderItemInfo}>
                        <p className={styles.orderItemName}>{item.name}</p>
                        <p className={styles.orderItemQuantity}>Cantidad: {item.quantity}</p>
                      </div>
                      <p className={styles.orderItemPrice}>
                        ${(item.price * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className={styles.orderTotals}>
                <div className={styles.orderTotalRow}>
                  <span className={styles.orderTotalLabel}>Subtotal:</span>
                  <span className={styles.orderTotalValue}>${orderDetailsModal.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className={styles.orderTotalRow}>
                  <span className={styles.orderTotalLabel}>Envío:</span>
                  <span className={styles.orderTotalValue}>${orderDetailsModal.shippingCost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className={styles.orderTotalRow}>
                  <span className={styles.orderTotalLabel}>Impuesto:</span>
                  <span className={styles.orderTotalValue}>${orderDetailsModal.tax.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className={styles.orderTotalFinal}>
                  <span className={styles.orderTotalLabelFinal}>Total:</span>
                  <span className={styles.orderTotalValueFinal}>${orderDetailsModal.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </BaseModal>
    </div>
  );
}
