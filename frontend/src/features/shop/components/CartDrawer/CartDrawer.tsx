/**
 * CartDrawer — Slide-out cart drawer from the right with backdrop blur.
 * Desktop only (≥1024px), falls back to /cart route on mobile via Header logic.
 *
 * Drawer shows cart items, quantities, coupon input, subtotal/discount/total,
 * and a checkout CTA button.
 *
 * Animations: GSAP slide-in from right, backdrop fade.
 * Accesses cartStore for state and actions.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@store/cartStore';
import { useToastStore } from '@store/toastStore';
import { couponService } from '@services/coupon.service';
import { formatPrice } from '@utils/formatPrice';
import { useGSAPAnimation } from '@hooks/useGSAPAnimation';
import styles from './CartDrawer.module.css';

export function CartDrawer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToastStore();

  const {
    items,
    isDrawerOpen,
    isLoading,
    coupon,
    closeDrawer,
    removeItem,
    updateQuantity,
    setCoupon,
  } = useCartStore();

  const { animate } = useGSAPAnimation();

  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // ── Computed values ──────────────────────────────────────
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = coupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discountAmount);

  // ── GSAP animation on open/close ────────────────────────
  useEffect(() => {
    if (!drawerRef.current || !backdropRef.current) return;

    if (isDrawerOpen) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Animate in
      animate(drawerRef.current, {
        x: 0,
        duration: 0.3,
        ease: 'power3.out',
      });
      animate(backdropRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });

      // Focus the drawer
      setTimeout(() => drawerRef.current?.focus(), 100);
    } else {
      // Reset
      if (drawerRef.current) {
        drawerRef.current.style.transform = 'translateX(100%)';
      }
      if (backdropRef.current) {
        backdropRef.current.style.opacity = '0';
      }

      // Restore focus
      previousFocusRef.current?.focus();
    }
  }, [isDrawerOpen, animate]);

  // ── Keyboard: Escape to close ────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeDrawer();
      }
    },
    [closeDrawer],
  );

  // ── Coupon logic ─────────────────────────────────────────
  const handleApplyCoupon = useCallback(async () => {
    const code = promoCode.trim();
    if (!code) {
      setPromoError(t('cart.enterCode'));
      return;
    }

    setIsApplying(true);
    setPromoError('');

    try {
      const result = await couponService.validate(code, subtotal);
      if (result.valid) {
        setCoupon({
          code: result.code,
          discountType: result.discountType,
          discountValue: result.discountValue,
          discountAmount: result.discountAmount,
        });
        toast.success(
          t('cart.couponApplied', { discount: formatPrice(result.discountAmount) }),
        );
        setPromoCode('');
      } else {
        setPromoError(result.message || t('cart.invalidCoupon'));
      }
    } catch {
      setPromoError(t('cart.couponError'));
    } finally {
      setIsApplying(false);
    }
  }, [promoCode, subtotal, setCoupon, t, toast]);

  const handleRemoveCoupon = useCallback(() => {
    setCoupon(null);
    toast.info(t('cart.couponRemoved'));
  }, [setCoupon, t, toast]);

  const handleCheckout = useCallback(() => {
    closeDrawer();
    navigate('/checkout');
  }, [closeDrawer, navigate]);

  // ── Render ───────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className={`${styles.backdrop} ${isDrawerOpen ? styles.backdropVisible : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`${styles.drawer} ${isDrawerOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={t('cart.drawer.title')}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        style={isDrawerOpen ? undefined : { transform: 'translateX(100%)' }}
      >
        {/* ── Header ──────────────────────────────────── */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {t('cart.drawer.title')}{' '}
            <span className={styles.titleCount}>
              ({itemCount} {itemCount === 1 ? t('cart.drawer.item') : t('cart.drawer.items')})
            </span>
          </h2>
          <button
            className={styles.closeButton}
            onClick={closeDrawer}
            aria-label={t('common.close')}
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Items ───────────────────────────────────── */}
        {items.length === 0 ? (
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
            <p className={styles.emptyTitle}>{t('cart.emptyTitle')}</p>
            <p className={styles.emptyText}>{t('cart.emptyText')}</p>
          </div>
        ) : (
          <>
            <div className={styles.itemsList} role="list" aria-live="polite">
              {items.map((item) => (
                <div key={item.id} className={styles.item} role="listitem">
                  <div className={styles.itemImage}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} loading="lazy" />
                    ) : (
                      <div className={styles.itemImagePlaceholder}>
                        <svg
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className={styles.itemDetails}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemPrice}>
                      {formatPrice(item.price)}
                    </p>
                    <div className={styles.itemActions}>
                      <button
                        className={styles.quantityBtn}
                        onClick={() =>
                          updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                        }
                        disabled={item.quantity <= 1}
                        aria-label={`${t('cart.drawer.decreaseQty')} ${item.name}`}
                        type="button"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                      <span className={styles.quantityValue}>
                        {item.quantity}
                      </span>
                      <button
                        className={styles.quantityBtn}
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        aria-label={`${t('cart.drawer.increaseQty')} ${item.name}`}
                        type="button"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                      <span className={styles.itemTotal}>
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  <button
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.productId)}
                    aria-label={`${t('cart.drawer.removeItem')} ${item.name}`}
                    title={t('cart.drawer.removeItem')}
                    type="button"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* ── Coupon ───────────────────────────────── */}
            <div className={styles.couponSection}>
              {coupon ? (
                <div className={styles.couponApplied}>
                  <span className={styles.couponAppliedCode}>
                    {t('cart.couponApplied', {
                      discount: formatPrice(coupon.discountAmount),
                    })}
                  </span>
                  <button
                    className={styles.couponRemoveBtn}
                    onClick={handleRemoveCoupon}
                    aria-label={t('cart.removeCoupon')}
                    type="button"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.couponForm}>
                    <input
                      className={styles.couponInput}
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        setPromoError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      placeholder={t('cart.couponPlaceholder')}
                      disabled={isApplying}
                      aria-label={t('cart.couponTitle')}
                    />
                    <button
                      className={styles.couponApplyBtn}
                      onClick={handleApplyCoupon}
                      disabled={isApplying || !promoCode.trim()}
                      type="button"
                    >
                      {isApplying
                        ? t('cart.validatingCoupon')
                        : t('cart.applyCoupon')}
                    </button>
                  </div>
                  {promoError && (
                    <p className={styles.couponError}>{promoError}</p>
                  )}
                </>
              )}
            </div>

            {/* ── Footer ──────────────────────────────── */}
            <div className={styles.footer}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>
                  {t('cart.subtotal')}
                </span>
                <span className={styles.summaryValue}>
                  {formatPrice(subtotal)}
                </span>
              </div>

              {coupon && (
                <div className={styles.discountRow}>
                  <span className={styles.discountLabel}>
                    {t('cart.discount', { code: coupon.code })}
                  </span>
                  <span className={styles.discountValue}>
                    -{formatPrice(discountAmount)}
                  </span>
                </div>
              )}

              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>
                  {t('cart.drawer.total')}
                </span>
                <span className={styles.totalValue}>
                  {formatPrice(total)}
                </span>
              </div>

              <button
                className={styles.checkoutBtn}
                onClick={handleCheckout}
                disabled={isLoading || items.length === 0}
                type="button"
              >
                {isLoading ? t('cart.processing') : t('cart.checkout')}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default CartDrawer;
