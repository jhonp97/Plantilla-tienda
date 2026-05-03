/**
 * CheckoutSuccessPage - Order confirmation after successful payment
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCheckoutStore } from '../../../store/checkoutStore';
import styles from './CheckoutSuccessPage.module.css';

export default function CheckoutSuccessPage() {
  const { t } = useTranslation();
  const { order, reset } = useCheckoutStore();

  useEffect(() => {
    // Reset checkout state on mount
    return () => {
      reset();
    };
  }, [reset]);

  // Generate a random order number for display
  const orderNumber = order?.orderNumber || `ORD-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <div className={styles.successCard}>
          {/* Success Icon */}
          <div className={styles.successIconContainer}>
            <div className={styles.successIconWrapper}>
              <svg
                className={styles.successIcon}
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
          <h1 className={styles.successTitle}>
            {t('checkout.orderConfirmed')}
          </h1>
          <p className={styles.successText}>
            {t('checkout.orderSuccess')}
          </p>
          <p className={styles.successTextSecondary}>
            {t('checkout.orderNumber', { number: orderNumber })}
          </p>

          {/* Email Notice */}
          <div className={styles.emailNotice}>
            <div className={styles.emailNoticeContent}>
              <svg className={styles.emailIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className={styles.emailNoticeText}>
                <p className={styles.emailNoticeTitle}>
                  {t('checkout.checkEmail')}
                </p>
                <p className={styles.emailNoticeText}>
                  {t('checkout.checkEmailDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className={styles.orderSummary}>
            <p className={styles.orderSummaryText}>
              {t('checkout.orderQuestions')}
            </p>
            <div className={styles.actionButtons}>
              <Link
                to="/orders"
                className={styles.primaryButton}
              >
                {t('checkout.viewOrders')}
              </Link>
              <Link
                to="/products"
                className={styles.secondaryButton}
              >
                {t('checkout.continueShopping')}
              </Link>
            </div>
          </div>

          {/* Support Info */}
          <div className={styles.supportInfo}>
            <p>
              {t('checkout.needHelp')}{' '}
              <a href="mailto:soporte@tienda.com" className={styles.supportLink}>
                {t('checkout.contactUs')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
