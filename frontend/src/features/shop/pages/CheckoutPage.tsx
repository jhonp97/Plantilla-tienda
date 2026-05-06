/**
 * CheckoutPage - Multi-step checkout wizard container
 * with sticky order summary sidebar and trust badges.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCheckoutStore } from '../../../store/checkoutStore';
import { useCartStore } from '../../../store/cartStore';
import { CheckoutHeader } from '@components/CheckoutHeader';
import { TrustBadges } from '@components/TrustBadges';
import { formatPrice } from '@utils/formatPrice';
import { CheckoutReviewStep } from '../components/CheckoutReviewStep';
import { CheckoutShippingStep } from '../components/CheckoutShippingStep';
import { CheckoutPaymentStep } from '../components/CheckoutPaymentStep';
import CheckoutSuccessPage from './CheckoutSuccessPage';
import styles from './CheckoutPage.module.css';

const STEPS = [
  { id: 'review', labelKey: 'checkout.stepReview', icon: '1' },
  { id: 'shipping', labelKey: 'checkout.stepShipping', icon: '2' },
  { id: 'payment', labelKey: 'checkout.stepPayment', icon: '3' },
  { id: 'confirmation', labelKey: 'checkout.stepConfirmation', icon: '4' },
];

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentStep, setStep } = useCheckoutStore();
  const { items, coupon } = useCartStore();

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && currentStep !== 'confirmation') {
      navigate('/cart');
    }
  }, [items.length, currentStep, navigate]);

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  // Computed values for summary sidebar
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = coupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discountAmount);

  const renderStep = () => {
    switch (currentStep) {
      case 'cart':
      case 'information':
        return <CheckoutReviewStep onNext={() => setStep('shipping')} />;
      case 'shipping':
        return (
          <CheckoutShippingStep
            onNext={() => setStep('payment')}
            onBack={() => setStep('cart')}
          />
        );
      case 'payment':
        return (
          <CheckoutPaymentStep
            onNext={() => setStep('confirmation')}
            onBack={() => setStep('shipping')}
          />
        );
      case 'confirmation':
        return <CheckoutSuccessPage />;
      default:
        return <CheckoutReviewStep onNext={() => setStep('shipping')} />;
    }
  };

  // Don't show stepper/summary on success page
  if (currentStep === 'confirmation') {
    return (
      <>
        <CheckoutHeader />
        {renderStep()}
      </>
    );
  }

  return (
    <>
      <CheckoutHeader />
      <div className={styles.pageContainer}>
        <div className={styles.checkoutLayout}>
          {/* ── Left: Steps ────────────────────────────── */}
          <div className={styles.stepsColumn}>
            <h1 className={styles.pageTitle}>{t('checkout.title')}</h1>

            {/* Stepper */}
            <div className={styles.stepperContainer}>
              <div className={styles.stepper}>
                {STEPS.map((step, index) => (
                  <div key={step.id} className={styles.step}>
                    {index > 0 && (
                      <div
                        className={`${styles.connector} ${
                          index <= currentStepIndex
                            ? styles.connectorActive
                            : styles.connectorInactive
                        }`}
                      />
                    )}
                    <button
                      onClick={() => {
                        if (index < currentStepIndex) {
                          setStep(step.id as typeof currentStep);
                        }
                      }}
                      disabled={index > currentStepIndex}
                      className={`${styles.stepButton} ${
                        index < currentStepIndex
                          ? styles.stepButtonCompleted
                          : index === currentStepIndex
                            ? styles.stepButtonActive
                            : styles.stepButtonPending
                      } ${index === currentStepIndex ? styles.stepButtonActiveRing : ''}`}
                      aria-label={t(step.labelKey)}
                    >
                      {index < currentStepIndex ? (
                        <svg className={styles.stepIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step.icon
                      )}
                    </button>
                    <p
                      className={`${styles.stepLabel} ${
                        index === currentStepIndex
                          ? styles.stepLabelActive
                          : index < currentStepIndex
                            ? styles.stepLabelCompleted
                            : styles.stepLabelPending
                      }`}
                    >
                      {t(step.labelKey)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className={styles.stepContent}>
              {renderStep()}
            </div>
          </div>

          {/* ── Right: Summary Sidebar ─────────────────── */}
          <div className={styles.summaryColumn}>
            <div className={styles.summarySticky}>
              <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>
                  {t('checkout.reviewOrder')}
                </h2>

                <div className={styles.summaryItem}>
                  <span className={styles.summaryItemLabel}>
                    {t('cart.subtotal')} ({items.length}{' '}
                    {items.length === 1 ? t('cart.drawer.item') : t('cart.drawer.items')})
                  </span>
                  <span className={styles.summaryItemValue}>
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {coupon && (
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryItemLabel}>
                      {t('cart.discount', { code: coupon.code })}
                    </span>
                    <span className={styles.summaryItemValue}>
                      -{formatPrice(discountAmount)}
                    </span>
                  </div>
                )}

                <div className={styles.summaryItem}>
                  <span className={styles.summaryItemLabel}>
                    {t('checkout.shipping')}
                  </span>
                  <span className={styles.summaryItemValue}>
                    {t('checkout.shippingCalcLater')}
                  </span>
                </div>

                <div className={styles.summaryDivider} />

                <div className={styles.summaryTotal}>
                  <span className={styles.summaryTotalLabel}>
                    {t('cart.totalWithDiscount')}
                  </span>
                  <span className={styles.summaryTotalValue}>
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Trust Badges */}
                <TrustBadges />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}