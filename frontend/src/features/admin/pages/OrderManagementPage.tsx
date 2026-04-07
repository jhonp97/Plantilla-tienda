/**
 * OrderManagementPage - Order management with Kanban and Table views
 */
import { useEffect, useState } from 'react';
import { useOrderStore } from '../../../store/orderStore';
import { OrderTable } from '../components/OrderTable';
import { OrderKanban } from '../components/OrderKanban';
import { OrderStatusModal } from '../components/OrderStatusModal';
import type { Order, OrderStatus, OrderFilters } from '../../../types/order.types';

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Órdenes</h1>
          <p className="text-gray-500 mt-1">Administra y rastrea todas las órdenes</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Tabla
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'kanban'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Kanban
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>Error: {error}</p>
          <button onClick={() => fetchOrders(filters)} className="mt-2 text-sm underline">
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
      {orderDetailsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Orden #{orderDetailsModal.orderNumber}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(orderDetailsModal.createdAt).toLocaleDateString('es-AR')}
                </p>
              </div>
              <button
                onClick={() => setOrderDetailsModal(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Estado:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  orderDetailsModal.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  orderDetailsModal.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                  orderDetailsModal.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {orderDetailsModal.status}
                </span>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Dirección de Envío</h4>
                <p className="text-gray-600 text-sm">
                  {orderDetailsModal.shippingAddress.firstName} {orderDetailsModal.shippingAddress.lastName}<br />
                  {orderDetailsModal.shippingAddress.address1}<br />
                  {orderDetailsModal.shippingAddress.city}, {orderDetailsModal.shippingAddress.state}<br />
                  {orderDetailsModal.shippingAddress.postalCode}, {orderDetailsModal.shippingAddress.country}
                </p>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Productos</h4>
                <div className="space-y-2">
                  {orderDetailsModal.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-white rounded border border-gray-200 overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ${(item.price * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="text-gray-900">${orderDetailsModal.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Envío:</span>
                  <span className="text-gray-900">${orderDetailsModal.shippingCost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Impuesto:</span>
                  <span className="text-gray-900">${orderDetailsModal.tax.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2">
                  <span>Total:</span>
                  <span>${orderDetailsModal.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}