import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from '@features/shop/components/CartDrawer';
import styles from './Layout.module.css';

interface LayoutProps {
  /** Child components to render */
  children: ReactNode;
  /** Hide the main Header (used by checkout) */
  hideHeader?: boolean;
  /** Hide the Footer (used by checkout) */
  hideFooter?: boolean;
}

/**
 * Layout - Main application shell with Header and Footer
 * @component
 * @description Provides the common layout structure for shop pages
 */
export function Layout({ children, hideHeader, hideFooter }: LayoutProps) {
  return (
    <div className={styles.layout}>
      {!hideHeader && <Header />}
      <main className={styles.main}>
        {children}
      </main>
      {!hideFooter && <Footer />}
      <CartDrawer />
    </div>
  );
}