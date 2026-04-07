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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Finalizar Compra
        </h1>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex-1 relative">
                {/* Connector Line */}
                {index > 0 && (
                  <div
                    className={`absolute top-5 left-[-50%] w-[100%] h-0.5 ${
                      index <= currentStepIndex
                        ? 'bg-blue-600'
                        : 'bg-gray-300'
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
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    index < currentStepIndex
                      ? 'bg-blue-600 text-white'
                      : index === currentStepIndex
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </button>

                {/* Step Label */}
                <p
                  className={`mt-2 text-xs sm:text-sm text-center ${
                    index === currentStepIndex
                      ? 'font-semibold text-blue-600'
                      : index < currentStepIndex
                      ? 'text-gray-600'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}