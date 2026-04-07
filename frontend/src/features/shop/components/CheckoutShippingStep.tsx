/**
 * CheckoutShippingStep - Shipping address form for guest checkout
 */
import { useState } from 'react';
import { useCheckoutStore } from '../../../store/checkoutStore';
import { AddressForm } from './AddressForm';
import type { Address, CreateAddressInput } from '../../../types/address.types';

interface CheckoutShippingStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function CheckoutShippingStep({ onNext, onBack }: CheckoutShippingStepProps) {
  const { shippingAddress, setShippingAddress, isLoading, setLoading, setError } = useCheckoutStore();
  const [formData, setFormData] = useState<CreateAddressInput>({
    type: 'SHIPPING',
    firstName: shippingAddress?.firstName || '',
    lastName: shippingAddress?.lastName || '',
    address1: shippingAddress?.address1 || '',
    address2: shippingAddress?.address2 || '',
    city: shippingAddress?.city || '',
    state: shippingAddress?.state || '',
    postalCode: shippingAddress?.postalCode || '',
    country: shippingAddress?.country || 'MX',
    phone: shippingAddress?.phone || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Los apellidos son requeridos';
    }
    if (!formData.address1.trim()) {
      newErrors.address1 = 'La dirección es requerida';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'El estado es requerido';
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'El código postal es requerido';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'El país es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Create address from form data
    const address: Address = {
      id: 'guest-shipping',
      userId: 'guest',
      ...formData,
      type: 'SHIPPING',
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setShippingAddress(address);
    onNext();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Información de Envío
      </h2>

      <form onSubmit={handleSubmit}>
        <AddressForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
        />

        {/* Shipping Options Placeholder */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">
            Método de Envío
          </h3>
          <div className="space-y-2">
            <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-white transition-colors">
              <input
                type="radio"
                name="shippingOption"
                defaultChecked
                className="mr-3 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Envío Estándar</p>
                <p className="text-sm text-gray-500">3-5 días hábiles</p>
              </div>
              <span className="font-medium text-gray-900">$9.99</span>
            </label>
            <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-white transition-colors">
              <input
                type="radio"
                name="shippingOption"
                className="mr-3 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Envío Express</p>
                <p className="text-sm text-gray-500">1-2 días hábiles</p>
              </div>
              <span className="font-medium text-gray-900">$19.99</span>
            </label>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-colors"
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Procesando...' : 'Continuar con Pago'}
          </button>
        </div>
      </form>
    </div>
  );
}