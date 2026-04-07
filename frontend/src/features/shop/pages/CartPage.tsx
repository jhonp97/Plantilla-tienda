/**
 * CartPage - Shopping cart main page with items and summary
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, type CartItem as CartItemType } from '../../../store/cartStore';
import { CartItem } from '../components/CartItem';
import { CartSummary } from '../components/CartSummary';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, isLoading } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setPromoError('Ingresa un código');
      return;
    }
    // TODO: Implement promo code validation
    setPromoError('Código no válido');
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const freeShippingThreshold = 100;
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = Math.max(freeShippingThreshold - subtotal, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <svg
              className="w-24 h-24 text-gray-300 mx-auto mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-500 mb-8">
              Agrega productos a tu carrito para continuar comprando
            </p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Ver Productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Tu Carrito ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}

            {/* Promo Code Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Código Promocional
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoError('');
                  }}
                  placeholder="Ingresa tu código"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
                >
                  Aplicar
                </button>
              </div>
              {promoError && (
                <p className="text-red-500 text-sm mt-2">{promoError}</p>
              )}
            </div>

            {/* Free Shipping Progress */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  {remainingForFreeShipping > 0
                    ? `Agrega $${remainingForFreeShipping.toFixed(2)} más para envío gratis`
                    : '¡Has conseguido envío gratis!'}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  ${subtotal.toFixed(2)} / ${freeShippingThreshold.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progress >= 100 ? 'bg-green-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <CartSummary />

              {/* Trust Badges */}
              <div className="bg-white rounded-lg shadow-md p-6 mt-4">
                <div className="flex items-center justify-center gap-4 text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-xs">SSL Secure</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.62l.89-2.213c.871-.997 2.496-1.726 4.056-1.726 1.967 0 3.797.932 3.797 2.759 0 .712-.312 1.167-1.529 1.167-1.052 0-3.418-.642-5.676-2.171l-.811 2.039c1.261 1.322 3.077 2.036 4.978 2.036 1.409 0 2.571-.436 2.955-1.624.439-1.335-.376-2.015-2.31-2.015-1.184 0-2.551.385-3.368.828l.254 1.511c.761-.516 1.671-.79 2.693-.79.721.016 1.14.226 1.14.697 0 .337-.255.617-1.379.617-1.145 0-3.679-1.039-5.592-2.836l.241-1.758c1.696 1.703 3.831 2.568 5.838 2.568 1.403 0 2.521-.335 2.868-1.415.408-1.269-.441-1.807-2.25-1.807-1.073 0-2.172.337-2.906.724l.221 1.514z" />
                    </svg>
                    <span className="text-xs">Stripe</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full mt-4 py-4 px-6 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Procesando...' : 'Proceder al Pago'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}