/**
 * CartSummary - Cart totals and summary display
 */
import { useCartStore } from '../../../store/cartStore';

export function CartSummary() {
  const { items } = useCartStore();

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingCost = subtotal >= 100 ? 0 : 9.99;
  const taxRate = 0.16; // 16% tax
  const tax = subtotal * taxRate;
  const total = subtotal + shippingCost + tax;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Resumen del Pedido
      </h2>

      {/* Subtotal */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-gray-600">Subtotal</span>
        <span className="text-gray-900">${subtotal.toFixed(2)}</span>
      </div>

      {/* Shipping */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-gray-600">Envío</span>
        <span className="text-gray-900">
          {shippingCost === 0 ? (
            <span className="text-green-600 font-medium">Gratis</span>
          ) : (
            `$${shippingCost.toFixed(2)}`
          )}
        </span>
      </div>

      {/* Tax */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-gray-600">Impuestos (16%)</span>
        <span className="text-gray-900">${tax.toFixed(2)}</span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Total */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-lg font-semibold text-gray-900">Total</span>
        <span className="text-2xl font-bold text-gray-900">
          ${total.toFixed(2)}
        </span>
      </div>

      {/* Shipping Calculator Note */}
      <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-600">
        <p>
          {shippingCost === 0
            ? '¡Has desbloqueado envío gratis!'
            : `Agrega $${(100 - subtotal).toFixed(2)} más para envío gratis`}
        </p>
      </div>

      {/* Tax Note */}
      <p className="text-xs text-gray-500 mt-4">
        * Los impuestos se calculan según la dirección de envío
      </p>
    </div>
  );
}