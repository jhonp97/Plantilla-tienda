/**
 * NotFoundPage - 404 page with link back to home
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SEO } from '@components/SEO';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title={t('pages.notFound.title')}
        description={t('pages.notFound.description')}
        pathname={window.location.pathname}
      />
      <div className={styles.pageContainer}>
        <div className={styles.content}>
          <span className={styles.errorCode}>{t('pages.notFound.errorCode')}</span>
          <h1 className={styles.title}>{t('pages.notFound.title')}</h1>
          <p className={styles.description}>
            {t('pages.notFound.message')}
          </p>
          <div className={styles.actions}>
            <Link to="/" className={styles.primaryButton}>
              {t('pages.notFound.goHome')}
            </Link>
            <Link to="/products" className={styles.secondaryButton}>
              {t('pages.notFound.viewProducts')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
