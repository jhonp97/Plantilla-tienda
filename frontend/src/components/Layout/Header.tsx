import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@hooks/useAuth';
import { useCartStore } from '@store/cartStore';
import { Button } from '@components/Button';
import { LanguageSelector } from '@components/LanguageSelector';
import styles from './Header.module.css';

/**
 * Header — Premium minimal header with logo, navigation, and cart trigger.
 */
export function Header() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const cartItems = useCartStore((s) => s.items);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const navigate = useNavigate();

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCartClick = () => {
    // Desktop: open drawer. Mobile: navigate to /cart
    if (window.innerWidth >= 1024) {
      openDrawer();
    } else {
      navigate('/cart');
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} aria-label={t('nav.home')}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.logoIcon}
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span className={styles.logoText}>{t('header.storeName')}</span>
        </Link>

        <nav className={styles.nav} aria-label={t('nav.mainNav')}>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            {t('nav.products')}
          </NavLink>
          {isAuthenticated && (
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              {t('nav.myOrders')}
            </NavLink>
          )}
          {isAuthenticated && user?.role === 'ADMIN' && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''} ${styles.adminLink}`
              }
            >
              {t('nav.dashboard')}
            </NavLink>
          )}
        </nav>

        <div className={styles.actions}>
          <LanguageSelector />

          <button
            className={styles.cartButton}
            onClick={handleCartClick}
            aria-label={t('nav.viewCart')}
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {itemCount > 0 && (
              <span className={styles.cartBadge} aria-live="polite">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>

          <div className={styles.auth}>
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
      </div>
    </header>
  );
}
