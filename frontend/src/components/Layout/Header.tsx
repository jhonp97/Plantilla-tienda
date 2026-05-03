import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@hooks/useAuth';
import { Button } from '@components/Button';
import { LanguageSelector } from '@components/LanguageSelector';
import styles from './Header.module.css';

/**
 * Header - Main navigation header component
 * @component
 */
export function Header() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/products" className={styles.logo} aria-label={t('nav.home')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.logoIcon}>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span className={styles.logoText}>{t('header.storeName')}</span>
        </Link>

        <nav className={styles.nav} aria-label={t('nav.mainNav')}>
          <NavLink 
            to="/products" 
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            aria-label={t('nav.viewCart')}
          >
            {t('nav.products')}
          </NavLink>
          <NavLink 
            to="/cart" 
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            aria-label={t('nav.viewCart')}
          >
            {t('nav.cart')}
          </NavLink>
          {isAuthenticated && (
            <NavLink 
              to="/orders" 
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              aria-label={t('nav.viewOrders')}
            >
              {t('nav.myOrders')}
            </NavLink>
          )}
          {isAuthenticated && user?.role === 'ADMIN' && (
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''} ${styles.adminLink}`}
              aria-label={t('nav.viewDashboard')}
            >
              {t('nav.dashboard')}
            </NavLink>
          )}
        </nav>

        <div className={styles.auth}>
          <LanguageSelector />
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <span className={styles.userName}>{user?.name || 'Usuario'}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                {t('nav.logout')}
              </Button>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  {t('nav.register')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
