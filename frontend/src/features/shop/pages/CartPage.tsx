/**
 * CartPage - Shopping cart main page with items and summary
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, type CartItem as CartItemType } from '../../../store/cartStore';
import { CartItem } from '../components/CartItem';
import { CartSummary } from '../components/CartSummary';
import styles from './CartPage.module.css';

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
      <div className={styles.pageContainer}>
        <div className={styles.emptyContainer}>
          <div className={styles.emptyState}>
            <svg
              className={styles.emptyIcon}
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
            <h2 className={styles.emptyTitle}>
              Tu carrito está vacío
            </h2>
            <p className={styles.emptyText}>
              Agrega productos a tu carrito para continuar comprando
            </p>
            <button
              onClick={() => navigate('/products')}
              className={styles.emptyButton}
            >
              Ver Productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>
          Tu Carrito ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h1>

        <div className={styles.cartGrid}>
          {/* Cart Items */}
          <div className={styles.cartItems}>
            <div className={styles.cartItemsList}>
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Promo Code Section */}
            <div className={styles.promoSection}>
              <h3 className={styles.promoTitle}>
                Código Promocional
              </h3>
              <div className={styles.promoForm}>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoError('');
                  }}
                  placeholder="Ingresa tu código"
                  className={styles.promoInput}
                />
                <button
                  onClick={handleApplyPromo}
                  className={styles.promoButton}
                >
                  Aplicar
                </button>
              </div>
              {promoError && (
                <p className={styles.promoError}>{promoError}</p>
              )}
            </div>

            {/* Free Shipping Progress */}
            <div className={styles.shippingProgress}>
              <div className={styles.shippingTextRow}>
                <span className={styles.shippingText}>
                  {remainingForFreeShipping > 0
                    ? `Agrega $${remainingForFreeShipping.toFixed(2)} más para envío gratis`
                    : '¡Has conseguido envío gratis!'}
                </span>
                <span className={styles.shippingAmount}>
                  ${subtotal.toFixed(2)} / ${freeShippingThreshold.toFixed(2)}
                </span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={`${styles.progressFill} ${
                    progress >= 100 ? styles.progressFillComplete : styles.progressFillProgress
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className={styles.summarySidebar}>
            <div className={styles.summarySticky}>
              <CartSummary />

              {/* Trust Badges */}
              <div className={styles.trustBadges}>
                <div className={styles.badgesRow}>
                  <div className={styles.badge}>
                    <svg className={styles.iconMd} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className={styles.badgeText}>SSL Secure</span>
                  </div>
                  <div className={styles.badge}>
                    <svg className={styles.iconMd} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.62l.89-2.213c.871-.997 2.496-1.726 4.056-1.726 1.967 0 3.797.932 3.797 2.759 0 .712-.312 1.167-1.529 1.167-1.052 0-3.418-.642-5.676-2.171l-.811 2.039c1.261 1.322 3.077 2.036 4.978 2.036 1.409 0 2.571-.436 2.955-1.624.439-1.335-.376-2.015-2.31-2.015-1.184 0-2.551.385-3.368.828l.254 1.511c.761-.516 1.671-.79 2.693-.79.721.016 1.14.226 1.14.697 0 .337-.255.617-1.379.617-1.145 0-3.679-1.039-5.592-2.836l.241-1.758c1.696 1.703 3.831 2.568 5.838 2.568 1.403 0 2.521-.335 2.868-1.415.408-1.269-.441-1.807-2.25-1.807-1.073 0-2.172.337-2.906.724l.221 1.514z" />
                    </svg>
                    <span className={styles.badgeText}>Stripe</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className={styles.checkoutButton}
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