/**
 * ShippingConfigPage - Configure shipping options and rates
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ShippingOption } from '../../../types/shipping.types';

interface ShippingFormData {
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
  carrier: string;
  isActive: boolean;
}

// Mock existing shipping options
const MOCK_SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: '1',
    name: 'Envío Estándar',
    description: 'Entrega en 5-7 días hábiles',
    price: 500,
    estimatedDays: 7,
    carrier: 'Correo Argentino',
    isActive: true,
  },
  {
    id: '2',
    name: 'Envío Express',
    description: 'Entrega en 24-48 horas',
    price: 1200,
    estimatedDays: 2,
    carrier: 'FedEx',
    isActive: true,
  },
  {
    id: '3',
    name: 'Retiro en Tienda',
    description: 'Retira tu pedido en nuestra tienda',
    price: 0,
    estimatedDays: 0,
    carrier: 'Retiro en persona',
    isActive: true,
  },
];

export default function ShippingConfigPage() {
  const navigate = useNavigate();
  const [options, setOptions] = useState<ShippingOption[]>(MOCK_SHIPPING_OPTIONS);
  const [showModal, setShowModal] = useState(false);
  const [editingOption, setEditingOption] = useState<ShippingOption | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ShippingFormData>({
    name: '',
    description: '',
    price: 0,
    estimatedDays: 0,
    carrier: '',
    isActive: true,
  });

  const handleOpenModal = (option?: ShippingOption) => {
    if (option) {
      setEditingOption(option);
      setFormData({
        name: option.name,
        description: option.description,
        price: option.price,
        estimatedDays: option.estimatedDays,
        carrier: option.carrier || '',
        isActive: option.isActive,
      });
    } else {
      setEditingOption(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        estimatedDays: 0,
        carrier: '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (editingOption) {
      // Update existing option
      setOptions(options.map(o => 
        o.id === editingOption.id
          ? { ...o, ...formData, carrier: formData.carrier || undefined }
          : o
      ));
    } else {
      // Create new option
      const newOption: ShippingOption = {
        id: Date.now().toString(),
        ...formData,
        carrier: formData.carrier || undefined,
      };
      setOptions([...options, newOption]);
    }

    setIsSaving(false);
    setShowModal(false);
  };

  const handleToggleActive = async (optionId: string) => {
    setOptions(options.map(o =>
      o.id === optionId ? { ...o, isActive: !o.isActive } : o
    ));
  };

  const handleDelete = async (optionId: string) => {
    if (confirm('¿Estás seguro de eliminar esta opción de envío?')) {
      setOptions(options.filter(o => o.id !== optionId));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración de Envío</h1>
          <p className="text-gray-500 mt-1">Administra las opciones de envío disponibles</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Opción
        </button>
      </div>

      {/* Shipping Options List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {options.map((option) => (
          <div
            key={option.id}
            className={`bg-white rounded-xl border-2 p-6 transition-all ${
              option.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{option.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{option.description}</p>
              </div>
              <button
                onClick={() => handleOpenModal(option)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Precio</span>
                <span className="text-sm font-medium text-gray-900">
                  {option.price === 0 ? 'Gratis' : `$${option.price.toLocaleString('es-AR')}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Tiempo de entrega</span>
                <span className="text-sm font-medium text-gray-900">
                  {option.estimatedDays === 0 ? 'Inmediato' : `${option.estimatedDays} días`}
                </span>
              </div>
              {option.carrier && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Transportista</span>
                  <span className="text-sm font-medium text-gray-900">{option.carrier}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleToggleActive(option.id)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  option.isActive
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {option.isActive ? 'Desactivar' : 'Activar'}
              </button>
              <button
                onClick={() => handleDelete(option.id)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {/* Add New Card */}
        <button
          onClick={() => handleOpenModal()}
          className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors min-h-[250px]"
        >
          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm font-medium">Agregar opción de envío</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingOption ? 'Editar Opción de Envío' : 'Nueva Opción de Envío'}
              </h3>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Envío Express"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Entrega en 24-48 horas"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Días de entrega
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedDays}
                    onChange={(e) => setFormData({ ...formData, estimatedDays: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transportista
                </label>
                <input
                  type="text"
                  value={formData.carrier}
                  onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Correo Argentino"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Opción activa
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !formData.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}