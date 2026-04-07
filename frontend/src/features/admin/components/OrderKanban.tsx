/**
 * OrderKanban - Kanban view for order management with drag-and-drop
 */
import { useState, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Order, OrderStatus } from '../../../types/order.types';

interface OrderKanbanProps {
  orders: Order[];
  isLoading?: boolean;
  onViewDetails: (order: Order) => void;
  onChangeStatus: (order: Order, newStatus: OrderStatus) => void;
}

const COLUMNS: { status: OrderStatus; label: string; color: string }[] = [
  { status: 'PENDING', label: 'Pendiente', color: 'bg-yellow-100 border-yellow-300' },
  { status: 'CONFIRMED', label: 'Confirmado', color: 'bg-blue-100 border-blue-300' },
  { status: 'PROCESSING', label: 'Procesando', color: 'bg-purple-100 border-purple-300' },
  { status: 'SHIPPED', label: 'Enviado', color: 'bg-indigo-100 border-indigo-300' },
  { status: 'DELIVERED', label: 'Entregado', color: 'bg-green-100 border-green-300' },
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
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <p className="font-medium text-gray-900 text-sm">#{order.orderNumber}</p>
        <span className="text-xs text-gray-500">
          {format(parseISO(order.createdAt), 'd MMM', { locale: es })}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-2">
        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
      </p>
      <div className="flex justify-between items-center">
        <p className="text-sm font-semibold text-gray-900">
          ${order.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-gray-500">{order.items.length} items</p>
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
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col.status} className="flex-shrink-0 w-72">
            <div className="bg-gray-100 rounded-lg p-4 h-96 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((column) => {
        const columnOrders = orders.filter((o) => o.status === column.status);
        const isDragOver = dragOverColumn === column.status;

        return (
          <div
            key={column.status}
            className={`flex-shrink-0 w-72 transition-colors rounded-lg ${
              isDragOver ? 'bg-gray-100 ring-2 ring-blue-400' : 'bg-gray-50'
            }`}
            onDragEnter={() => handleDragEnter(column.status)}
            onDragLeave={() => handleDragLeave(column.status)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            {/* Column Header */}
            <div className={`p-3 rounded-t-lg border-b-2 ${column.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">{column.label}</h3>
                <span className="px-2 py-0.5 bg-white text-gray-700 text-sm font-medium rounded-full">
                  {columnOrders.length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className="p-2 space-y-2 min-h-96 max-h-[600px] overflow-y-auto">
              {columnOrders.length === 0 ? (
                <div className="h-24 flex items-center justify-center text-gray-400 text-sm">
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