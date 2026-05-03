/**
 * Format a price amount as a localized currency string
 * Prices are expected in cents by default and converted to the main unit
 */

import { CURRENCY_CONFIG } from './currencyConfig';

export interface FormatPriceOptions {
  locale?: string;
  currency?: string;
  inCents?: boolean;
}

/**
 * Formats a numeric amount as a localized currency string using Intl.NumberFormat
 *
 * @param amount - The numeric price value (in cents by default)
 * @param options - Formatting options
 * @returns Formatted currency string (e.g. "99,99 €")
 *
 * @example
 * formatPrice(9999) → "99,99 €"
 * formatPrice(9999, { currency: 'USD' }) → "$99.99"
 * formatPrice(null) → "0,00 €"
 * formatPrice(0) → "0,00 €"
 * formatPrice(-5000) → "-50,00 €"
 */
export function formatPrice(
  amount: number | null | undefined,
  options: FormatPriceOptions = {},
): string {
  const {
    locale = CURRENCY_CONFIG.defaultLocale,
    currency = CURRENCY_CONFIG.defaultCurrency,
    inCents = true,
  } = options;

  // Handle null, undefined, NaN, and 0
  if (amount == null || Number.isNaN(amount) || amount === 0) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(0);
  }

  // Convert cents to main unit if needed
  const value = inCents ? amount / 100 : amount;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
