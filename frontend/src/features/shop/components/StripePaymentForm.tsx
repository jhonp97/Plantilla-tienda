/**
 * StripePaymentForm - Stripe Elements integration for card payments
 * Note: Requires @stripe/stripe-js and @stripe/react-stripe-js packages
 */
import { useState, useEffect } from 'react';
import { useCheckoutStore } from '../../../store/checkoutStore';
import styles from './StripePaymentForm.module.css';

interface StripePaymentFormProps {
  amount: number;
  onSuccess: () => void;
}

// Demo card numbers for testing
const TEST_CARDS = [
  { brand: 'Visa', number: '4242424242424242' },
  { brand: 'Mastercard', number: '5555555555554444' },
  { brand: 'AMEX', number: '378282246310005' },
];

export function StripePaymentForm({ amount, onSuccess }: StripePaymentFormProps) {
  const { setPaymentIntentId, setLoading, isLoading, error, setError } = useCheckoutStore();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts: string[] = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateCard = (): boolean => {
    const errors: Record<string, string> = {};

    // Card number validation (basic Luhn check could be added)
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      errors.cardNumber = 'Número de tarjeta inválido';
    }

    // Expiry validation
    const [month, year] = expiry.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (!month || !year || parseInt(month) > 12 || parseInt(month) < 1) {
      errors.expiry = 'Fecha inválida';
    } else if (parseInt(year) < currentYear ||
               (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      errors.expiry = 'Tarjeta vencida';
    }

    // CVC validation
    if (cvc.length < 3 || cvc.length > 4) {
      errors.cvc = 'CVC inválido';
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCard()) return;

    setLoading(true);
    setError(null);

    try {
      // In production, this would:
      // 1. Create a payment intent on the server
      // 2. Use Stripe.js to confirm the payment
      // 3. Handle 3D Secure if required

      // Simulating payment intent creation
      const paymentIntentId = 'pi_demo_' + Date.now();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setPaymentIntentId(paymentIntentId);
      onSuccess();
    } catch (err) {
      setError('Error al procesar el pago. Por favor intenta de nuevo.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Card Number */}
      <div className={styles.formGroup}>
        <label htmlFor="cardNumber" className={styles.label}>
          Número de Tarjeta
        </label>
        <div className={styles.cardInputWrapper}>
          <input
            type="text"
            id="cardNumber"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            placeholder="4242 4242 4242 4242"
            className={`${styles.input} ${cardErrors.cardNumber ? styles.inputError : ''}`}
          />
          <div className={styles.cardIcon}>
            <svg className="h-8 w-auto" viewBox="0 0 50 20" fill="none">
              <rect width="50" height="20" rx="2" fill="#F1F5F9" />
              <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="8" fill="#64748B">VISA</text>
            </svg>
          </div>
        </div>
        {cardErrors.cardNumber && (
          <p className={styles.errorText}>{cardErrors.cardNumber}</p>
        )}
      </div>

      {/* Expiry and CVC */}
      <div className={styles.expiryCvcRow}>
        <div className={styles.formGroup}>
          <label htmlFor="expiry" className={styles.label}>
            Vencimiento
          </label>
          <input
            type="text"
            id="expiry"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            maxLength={5}
            placeholder="MM/YY"
            className={`${styles.input} ${cardErrors.expiry ? styles.inputError : ''}`}
          />
          {cardErrors.expiry && (
            <p className={styles.errorText}>{cardErrors.expiry}</p>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="cvc" className={styles.label}>
            CVC
          </label>
          <input
            type="text"
            id="cvc"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            placeholder="123"
            className={`${styles.input} ${cardErrors.cvc ? styles.inputError : ''}`}
          />
          {cardErrors.cvc && (
            <p className={styles.errorText}>{cardErrors.cvc}</p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          <p className={styles.errorMessageText}>{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !cardNumber || !expiry || !cvc}
        className={styles.submitButton}
      >
        {isLoading ? (
          <span className={styles.spinner}>
            <svg className={styles.spinnerIcon} viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Procesando pago...
          </span>
        ) : (
          `Pagar $${amount.toFixed(2)}`
        )}
      </button>

      {/* Test Cards Info */}
      <div className={styles.testCardsInfo}>
        <p className={styles.testCardsLabel}>Tarjetas de prueba:</p>
        <div className={styles.testCardsList}>
          {TEST_CARDS.map((card) => (
            <button
              key={card.number}
              type="button"
              onClick={() => setCardNumber(card.number)}
              className={styles.testCardButton}
            >
              {card.brand}
            </button>
          ))}
        </div>
        <p className={styles.testCardsHint}>
          Use cualquier fecha futura y CVC de 3 dígitos
        </p>
      </div>
    </form>
  );
}