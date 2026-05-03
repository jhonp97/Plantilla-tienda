/**
 * Currency configuration for the store
 * Defines default locale, currency, and supported currencies
 */

export interface CurrencyConfig {
  defaultLocale: string;
  defaultCurrency: string;
  supportedCurrencies: string[];
}

export const CURRENCY_CONFIG: CurrencyConfig = {
  defaultLocale: 'es-ES',
  defaultCurrency: 'EUR',
  supportedCurrencies: ['EUR', 'USD', 'GBP', 'MXN', 'COP', 'CLP'],
};
