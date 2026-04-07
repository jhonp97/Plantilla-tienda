/**
 * CheckoutSuccessPage - Order confirmation after successful payment
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCheckoutStore } from '../../../store/checkoutStore';

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const { order, reset } = useCheckoutStore();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Reset checkout state on mount
    return () => {
      reset();
    };
  }, [reset]);

  // Generate a random order number for display
  const orderNumber = order?.orderNumber || `ORD-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Pedido Confirmado!
          </h1>
          <p className="text-gray-600 mb-2">
            Gracias por tu compra. Tu pedido ha sido procesado exitosamente.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Número de pedido: <span className="font-mono font-semibold">{orderNumber}</span>
          </p>

          {/* Email Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-blue-900">
                  Revisa tu correo electrónico
                </p>
                <p className="text-sm text-blue-700">
                  Te hemos enviado un correo de confirmación con los detalles de tu pedido.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <p className="text-gray-600 mb-4">
              ¿Tienes preguntas sobre tu pedido?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/orders"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Ver Mis Pedidos
              </Link>
              <Link
                to="/products"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Seguir Comprando
              </Link>
            </div>
          </div>

          {/* Support Info */}
          <div className="text-sm text-gray-500">
            <p>
              ¿Necesitas ayuda?{' '}
              <a href="mailto:soporte@tienda.com" className="text-blue-600 hover:underline">
                Contáctanos
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}