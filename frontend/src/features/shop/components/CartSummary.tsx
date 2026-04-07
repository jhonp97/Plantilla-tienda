/**
 * CartSummary - Cart totals and summary display
 */
import { useCartStore } from '../../../store/cartStore';
import styles from './CartSummary.module.css';

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
    <div className={styles.cartSummary}>
      <h2 className={styles.summaryTitle}>
        Resumen del Pedido
      </h2>

      {/* Subtotal */}
      <div className={styles.summaryRow}>
        <span className={styles.summaryLabel}>Subtotal</span>
        <span className={styles.summaryValue}>${subtotal.toFixed(2)}</span>
      </div>

      {/* Shipping */}
      <div className={styles.summaryRow}>
        <span className={styles.summaryLabel}>Envío</span>
        <span className={styles.summaryValue}>
          {shippingCost === 0 ? (
            <span className={styles.freeShipping}>Gratis</span>
          ) : (
            `$${shippingCost.toFixed(2)}`
          )}
        </span>
      </div>

      {/* Tax */}
      <div className={styles.summaryRow}>
        <span className={styles.summaryLabel}>Impuestos (16%)</span>
        <span className={styles.summaryValue}>${tax.toFixed(2)}</span>
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Total */}
      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total</span>
        <span className={styles.totalValue}>
          ${total.toFixed(2)}
        </span>
      </div>

      {/* Shipping Calculator Note */}
      <div className={styles.shippingNote}>
        <p>
          {shippingCost === 0
            ? '¡Has desbloqueado envío gratis!'
            : `Agrega $${(100 - subtotal).toFixed(2)} más para envío gratis`}
        </p>
      </div>

      {/* Tax Note */}
      <p className={styles.taxNote}>
        * Los impuestos se calculan según la dirección de envío
      </p>
    </div>
  );
}