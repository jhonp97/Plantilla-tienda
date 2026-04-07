/**
 * CheckoutPaymentStep - Payment method selection and processing
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckoutStore } from '../../../store/checkoutStore';
import { useCartStore } from '../../../store/cartStore';
import { StripePaymentForm } from './StripePaymentForm';

interface CheckoutPaymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function CheckoutPaymentStep({ onNext, onBack }: CheckoutPaymentStepProps) {
  const navigate = useNavigate();
  const { shippingAddress, paymentMethod, setPaymentMethod, isLoading, setError } = useCheckoutStore();
  const { items, clearCart } = useCartStore();

  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'transfer' | null>(
    paymentMethod
  );

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingCost = 9.99;
  const tax = subtotal * 0.16;
  const total = subtotal + shippingCost + tax;

  const handleMethodSelect = (method: 'stripe' | 'transfer') => {
    setSelectedMethod(method);
    setPaymentMethod(method);
  };

  const handlePaymentSuccess = () => {
    clearCart();
    onNext();
  };

  const handleTransferSubmit = async () => {
    if (!selectedMethod) {
      return;
    }

    // In a real implementation, this would create the order and redirect
    // to the transfer payment page or show transfer instructions
    try {
      // Simulate order creation
      console.log('Creating order with transfer payment...');
      handlePaymentSuccess();
    } catch (error) {
      setError('Error al procesar el pago. Por favor intenta de nuevo.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Método de Pago
      </h2>

      {/* Order Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Envío</span>
          <span className="text-gray-900">${shippingCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Impuestos (16%)</span>
          <span className="text-gray-900">${tax.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-xl font-bold text-gray-900">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Shipping Address Summary */}
      {shippingAddress && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium text-gray-900 mb-2">Dirección de Envío</h3>
          <p className="text-gray-600 text-sm">
            {shippingAddress.firstName} {shippingAddress.lastName}
          </p>
          <p className="text-gray-600 text-sm">{shippingAddress.address1}</p>
          {shippingAddress.address2 && (
            <p className="text-gray-600 text-sm">{shippingAddress.address2}</p>
          )}
          <p className="text-gray-600 text-sm">
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
          </p>
          <p className="text-gray-600 text-sm">{shippingAddress.country}</p>
          {shippingAddress.phone && (
            <p className="text-gray-600 text-sm">Tel: {shippingAddress.phone}</p>
          )}
        </div>
      )}

      {/* Payment Methods */}
      <div className="space-y-4">
        {/* Stripe Card */}
        <label
          className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedMethod === 'stripe'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="stripe"
            checked={selectedMethod === 'stripe'}
            onChange={() => handleMethodSelect('stripe')}
            className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.62l.89-2.213c.871-.997 2.496-1.726 4.056-1.726 1.967 0 3.797.932 3.797 2.759 0 .712-.312 1.167-1.529 1.167-1.052 0-3.418-.642-5.676-2.171l-.811 2.039c1.261 1.322 3.077 2.036 4.978 2.036 1.409 0 2.571-.436 2.955-1.624.439-1.335-.376-2.015-2.31-2.015-1.184 0-2.551.385-3.368.828l.254 1.511c.761-.516 1.671-.79 2.693-.79.721.016 1.14.226 1.14.697 0 .337-.255.617-1.379.617-1.145 0-3.679-1.039-5.592-2.836l.241-1.758c1.696 1.703 3.831 2.568 5.838 2.568 1.403 0 2.521-.335 2.868-1.415.408-1.269-.441-1.807-2.25-1.807-1.073 0-2.172.337-2.906.724l.221 1.514z" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Tarjeta de Crédito/Débito</p>
                  <p className="text-sm text-gray-500">Visa, Mastercard, AMEX</p>
                </div>
              </div>
            </div>

            {/* Stripe Form */}
            {selectedMethod === 'stripe' && (
              <div className="mt-4">
                <StripePaymentForm
                  amount={total}
                  onSuccess={handlePaymentSuccess}
                />
              </div>
            )}
          </div>
        </label>

        {/* Bank Transfer */}
        <label
          className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedMethod === 'transfer'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="transfer"
            checked={selectedMethod === 'transfer'}
            onChange={() => handleMethodSelect('transfer')}
            className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Transferencia Bancaria</p>
            <p className="text-sm text-gray-500">
              Te enviaremos los datos para realizar la transferencia
            </p>
          </div>
        </label>
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
          onClick={handleTransferSubmit}
          disabled={!selectedMethod || selectedMethod !== 'transfer' || isLoading}
          className="flex-1 py-3 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Procesando...' : 'Completar Pedido'}
        </button>
      </div>

      {/* Trust Badges */}
      <div className="mt-6 flex items-center justify-center gap-4 text-gray-400">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs">Pago Seguro</span>
        </div>
      </div>
    </div>
  );
}