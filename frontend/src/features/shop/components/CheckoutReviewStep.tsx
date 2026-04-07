/**
 * CheckoutReviewStep - Review cart items before checkout
 */
import { useState } from 'react';
import { useCartStore } from '../../../store/cartStore';
import { useCheckoutStore } from '../../../store/checkoutStore';
import styles from './CheckoutReviewStep.module.css';

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
      <div className={styles.header}>
        <h2 className={styles.title}>
          Revisar tu Pedido
        </h2>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={styles.collapseButton}
        >
          {isCollapsed ? 'Expandir' : 'Colapsar'}
        </button>
      </div>

      {/* Cart Items */}
      <div
        className={`${styles.cartItems} ${
          isCollapsed ? styles.cartItemsCollapsed : styles.cartItemsExpanded
        }`}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={styles.cartItem}
          >
            {/* Product Image */}
            <div className={styles.cartItemImage}>
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                />
              ) : (
                <div className={styles.cartItemImagePlaceholder}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className={styles.cartItemInfo}>
              <h3 className={styles.cartItemName}>
                {item.name}
              </h3>
              <p className={styles.cartItemQuantity}>
                Cantidad: {item.quantity}
              </p>
            </div>

            {/* Item Total */}
            <div className={styles.cartItemTotal}>
              <p className={styles.cartItemTotalValue}>
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className={styles.orderSummary}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Subtotal</span>
          <span className={styles.summaryValue}>${subtotal.toFixed(2)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Envío</span>
          <span className={styles.summaryPending}>
            Se calculará en el siguiente paso
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Impuestos</span>
          <span className={styles.summaryPending}>
            Se calculará en el siguiente paso
          </span>
        </div>
      </div>

      {/* Continue Button */}
      <div>
        <button
          onClick={handleContinue}
          className={styles.continueButton}
        >
          Continuar con Envío
        </button>
      </div>
    </div>
  );
}