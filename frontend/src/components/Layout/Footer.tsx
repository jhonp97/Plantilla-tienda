import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Footer.module.css';

/**
 * Footer - Site footer with links and copyright
 * @component
 */
export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>{t('footer.storeName')}</h3>
            <p className={styles.columnText}>
              {t('footer.tagline')}
            </p>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>{t('footer.shop')}</h3>
            <Link to="/products" className={styles.link}>{t('footer.products')}</Link>
            <Link to="/cart" className={styles.link}>{t('footer.cart')}</Link>
            <Link to="/orders" className={styles.link}>{t('footer.myOrders')}</Link>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>{t('footer.help')}</h3>
            <Link to="/faq" className={styles.link}>{t('footer.faq')}</Link>
            <Link to="/shipping" className={styles.link}>{t('footer.shipping')}</Link>
            <Link to="/returns" className={styles.link}>{t('footer.returns')}</Link>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>{t('footer.legal')}</h3>
            <Link to="/terms" className={styles.link}>{t('footer.terms')}</Link>
            <Link to="/privacy" className={styles.link}>{t('footer.privacy')}</Link>
            <Link to="/cookies" className={styles.link}>{t('footer.cookies')}</Link>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            {t('footer.copyright', { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  );
}
