import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import styles from './Layout.module.css';

interface LayoutProps {
  /** Child components to render */
  children: ReactNode;
}

/**
 * Layout - Main application shell with Header and Footer
 * @component
 * @description Provides the common layout structure for shop pages
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        {children}
      </main>
      <Footer />
    </div>
  );
}