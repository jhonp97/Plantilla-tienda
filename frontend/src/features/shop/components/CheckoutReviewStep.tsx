/**
 * CheckoutReviewStep - Review cart items before checkout
 */
import { useState } from 'react';
import { useCartStore } from '../../../store/cartStore';
import { useCheckoutStore } from '../../../store/checkoutStore';

interface CheckoutReviewStepProps {
  onNext: () => void;
}

export function CheckoutReviewStep({ onNext }: CheckoutReviewStepProps) {
  const { items } = useCartStore();
  const { nextStep } = useCheckoutStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleContinue = () => {
    onNext();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Revisar tu Pedido
        </h2>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
        >
          {isCollapsed ? 'Expandir' : 'Colapsar'}
        </button>
      </div>

      {/* Cart Items */}
      <div
        className={`space-y-4 transition-all duration-300 ${
          isCollapsed ? 'max-h-0 overflow-hidden' : 'max-h-none'
        }`}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 p-4 bg-gray-50 rounded-md border border-gray-200"
          >
            {/* Product Image */}
            <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-white">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 line-clamp-2">
                {item.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Cantidad: {item.quantity}
              </p>
            </div>

            {/* Item Total */}
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Envío</span>
          <span className="text-gray-500 text-sm">
            Se calculará en el siguiente paso
          </span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Impuestos</span>
          <span className="text-gray-500 text-sm">
            Se calculará en el siguiente paso
          </span>
        </div>
      </div>

      {/* Continue Button */}
      <div className="mt-8">
        <button
          onClick={handleContinue}
          className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
        >
          Continuar con Envío
        </button>
      </div>
    </div>
  );
}