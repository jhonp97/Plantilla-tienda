/**
 * CheckoutPage - Multi-step checkout wizard container
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckoutStore } from '../../../store/checkoutStore';
import { useCartStore } from '../../../store/cartStore';
import { CheckoutReviewStep } from '../components/CheckoutReviewStep';
import { CheckoutShippingStep } from '../components/CheckoutShippingStep';
import { CheckoutPaymentStep } from '../components/CheckoutPaymentStep';
import CheckoutSuccessPage from './CheckoutSuccessPage';
import styles from './CheckoutPage.module.css';

const STEPS = [
  { id: 'review', label: 'Revisar', icon: '1' },
  { id: 'shipping', label: 'Envío', icon: '2' },
  { id: 'payment', label: 'Pago', icon: '3' },
  { id: 'confirmation', label: 'Confirmación', icon: '4' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { currentStep, setStep } = useCheckoutStore();
  const { items } = useCartStore();

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && currentStep !== 'confirmation') {
      navigate('/cart');
    }
  }, [items.length, currentStep, navigate]);

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

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

  // Don't show stepper on success page
  if (currentStep === 'confirmation') {
    return renderStep();
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>
          Finalizar Compra
        </h1>

        {/* Stepper */}
        <div className={styles.stepperContainer}>
          <div className={styles.stepper}>
            {STEPS.map((step, index) => (
              <div key={step.id} className={styles.step}>
                {/* Connector Line */}
                {index > 0 && (
                  <div
                    className={`${styles.connector} ${
                      index <= currentStepIndex
                        ? styles.connectorActive
                        : styles.connectorInactive
                    }`}
                  />
                )}

                {/* Step Circle */}
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
                >
                  {index < currentStepIndex ? (
                    <svg className={styles.stepIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </button>

                {/* Step Label */}
                <p
                  className={`${styles.stepLabel} ${
                    index === currentStepIndex
                      ? styles.stepLabelActive
                      : index < currentStepIndex
                      ? styles.stepLabelCompleted
                      : styles.stepLabelPending
                  }`}
                >
                  {step.label}
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
    </div>
  );
}