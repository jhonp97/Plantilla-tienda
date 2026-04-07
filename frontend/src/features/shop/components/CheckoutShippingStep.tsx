/**
 * CheckoutShippingStep - Shipping address form for guest checkout
 */
import { useState } from 'react';
import { useCheckoutStore } from '../../../store/checkoutStore';
import { AddressForm } from './AddressForm';
import type { Address, CreateAddressInput } from '../../../types/address.types';
import styles from './CheckoutShippingStep.module.css';

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
      <h2 className={styles.title}>
        Información de Envío
      </h2>

      <form onSubmit={handleSubmit}>
        <AddressForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
        />

        {/* Shipping Options Placeholder */}
        <div className={styles.shippingOptions}>
          <h3 className={styles.shippingOptionsTitle}>
            Método de Envío
          </h3>
          <div className={styles.shippingOptionsList}>
            <label className={styles.shippingOption}>
              <input
                type="radio"
                name="shippingOption"
                defaultChecked
                className={styles.shippingOptionInput}
              />
              <div className={styles.shippingOptionInfo}>
                <p className={styles.shippingOptionName}>Envío Estándar</p>
                <p className={styles.shippingOptionTime}>3-5 días hábiles</p>
              </div>
              <span className={styles.shippingOptionPrice}>$9.99</span>
            </label>
            <label className={styles.shippingOption}>
              <input
                type="radio"
                name="shippingOption"
                className={styles.shippingOptionInput}
              />
              <div className={styles.shippingOptionInfo}>
                <p className={styles.shippingOptionName}>Envío Express</p>
                <p className={styles.shippingOptionTime}>1-2 días hábiles</p>
              </div>
              <span className={styles.shippingOptionPrice}>$19.99</span>
            </label>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className={styles.navButtons}>
          <button
            type="button"
            onClick={onBack}
            className={styles.backButton}
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={styles.continueButton}
          >
            {isLoading ? 'Procesando...' : 'Continuar con Pago'}
          </button>
        </div>
      </form>
    </div>
  );
}