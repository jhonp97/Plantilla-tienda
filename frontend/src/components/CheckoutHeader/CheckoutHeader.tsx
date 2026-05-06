/**
 * CheckoutHeader — Minimalist header for the checkout page.
 * Shows logo and a "Volver a la tienda" back link.
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './CheckoutHeader.module.css';

export interface CheckoutHeaderProps {
  /** Optional custom back label (defaults to i18n key) */
  backLabel?: string;
}

export function CheckoutHeader({ backLabel }: CheckoutHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} aria-label={t('nav.home')}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span>{t('header.storeName')}</span>
        </Link>

        <Link
          to="/products"
          className={styles.backLink}
          aria-label={t('checkout.backToStore')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          {backLabel || t('checkout.backToStore')}
        </Link>
      </div>
    </header>
  );
}

export default CheckoutHeader;
