/**
 * OrderStatusModal - Modal to change order status
 */
import { useState } from 'react';
import type { OrderStatus } from '../../../types/order.types';

interface OrderStatusModalProps {
  isOpen: boolean;
  currentStatus: OrderStatus;
  orderNumber: string;
  onConfirm: (newStatus: OrderStatus) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const STATUS_OPTIONS: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'PENDING', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CONFIRMED', label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
  { value: 'PROCESSING', label: 'Procesando', color: 'bg-purple-100 text-purple-800' },
  { value: 'SHIPPED', label: 'Enviado', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'DELIVERED', label: 'Entregado', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  { value: 'REFUNDED', label: 'Reembolsado', color: 'bg-gray-100 text-gray-800' },
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Cambiar Estado de Orden</h3>
          <p className="text-sm text-gray-500 mt-1">Orden #{orderNumber}</p>
        </div>

        {/* Current Status */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Estado Actual</p>
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${currentStatusObj?.color}`}>
            {currentStatusObj?.label || currentStatus}
          </span>
        </div>

        {/* Status Options */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-500 mb-3">Seleccionar Nuevo Estado</p>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status.value}
                onClick={() => setSelectedStatus(status.value)}
                disabled={status.value === currentStatus}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedStatus === status.value
                    ? `${status.color} ring-2 ring-offset-2 ring-blue-500`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${status.value === currentStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(selectedStatus)}
            disabled={selectedStatus === currentStatus || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Guardando...' : 'Confirmar Cambio'}
          </button>
        </div>
      </div>
    </div>
  );
}