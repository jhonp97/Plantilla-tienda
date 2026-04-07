/**
 * StripePaymentForm - Stripe Elements integration for card payments
 * Note: Requires @stripe/stripe-js and @stripe/react-stripe-js packages
 */
import { useState, useEffect } from 'react';
import { useCheckoutStore } from '../../../store/checkoutStore';

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

  // Note: In production, you would initialize Stripe Elements here
  // import { loadStripe } from '@stripe/stripe-js';
  // import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
  //
  // const stripePromise = loadStripe('your-publishable-key');
  // Then wrap this component with <Elements stripe={stripePromise}>

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card Number */}
      <div>
        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Número de Tarjeta
        </label>
        <div className="relative">
          <input
            type="text"
            id="cardNumber"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            placeholder="4242 4242 4242 4242"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              cardErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="h-8 w-auto" viewBox="0 0 50 20" fill="none">
              <rect width="50" height="20" rx="2" fill="#F1F5F9" />
              <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="8" fill="#64748B">VISA</text>
            </svg>
          </div>
        </div>
        {cardErrors.cardNumber && (
          <p className="text-red-500 text-sm mt-1">{cardErrors.cardNumber}</p>
        )}
      </div>

      {/* Expiry and CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
            Vencimiento
          </label>
          <input
            type="text"
            id="expiry"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            maxLength={5}
            placeholder="MM/YY"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              cardErrors.expiry ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {cardErrors.expiry && (
            <p className="text-red-500 text-sm mt-1">{cardErrors.expiry}</p>
          )}
        </div>
        <div>
          <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
            CVC
          </label>
          <input
            type="text"
            id="cvc"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            placeholder="123"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              cardErrors.cvc ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {cardErrors.cvc && (
            <p className="text-red-500 text-sm mt-1">{cardErrors.cvc}</p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !cardNumber || !expiry || !cvc}
        className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <p className="text-xs text-gray-500 mb-2">Tarjetas de prueba:</p>
        <div className="flex flex-wrap gap-2">
          {TEST_CARDS.map((card) => (
            <button
              key={card.number}
              type="button"
              onClick={() => setCardNumber(card.number)}
              className="text-xs px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100"
            >
              {card.brand}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Use cualquier fecha futura y CVC de 3 dígitos
        </p>
      </div>
    </form>
  );
}