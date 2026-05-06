/**
 * DashboardStats — Premium monochrome KPI cards with staggerIn animation.
 * Uses GridContainer for layout, Playfair Display for numbers,
 * uppercase letter-spacing labels, and GSAP staggerIn on mount.
 */
import { useEffect, useRef, useMemo } from 'react';
import { useGSAPAnimation } from '../../../hooks/useGSAPAnimation';
import { GridContainer } from '../../../components/GridContainer';
import { formatPrice } from '../../../utils';
import styles from './DashboardStats.module.css';

interface DashboardStatsProps {
  todaySales: number;
  weekSales: number;
  pendingOrders: number;
  lowStockCount: number;
  isLoading?: boolean;
}

function StatCard({
  title,
  value,
  subValue,
  icon,
}: {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={styles.statCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardContent}>
          <p className={styles.cardTitle}>{title}</p>
          <p className={styles.cardValue}>
            {typeof value === 'number' ? value.toLocaleString('es-AR') : value}
          </p>
          {subValue && <p className={styles.cardSubValue}>{subValue}</p>}
        </div>
        <div className={styles.iconContainer}>{icon}</div>
      </div>
    </div>
  );
}

export function DashboardStats({
  todaySales,
  weekSales,
  pendingOrders,
  lowStockCount,
  isLoading,
}: DashboardStatsProps) {
  const { staggerIn } = useGSAPAnimation();
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && cardsRef.current) {
      const cards = cardsRef.current.children;
      if (cards.length > 0) {
        staggerIn({ targets: cards as unknown as Element[], stagger: 0.08 });
      }
    }
  }, [isLoading, staggerIn]);

  const stats = useMemo(() => [
    {
      title: 'Ventas Hoy',
      value: formatPrice(todaySales),
      subValue: '+12.5% vs ayer',
      icon: (
        <svg className={styles.iconAccent} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Ventas Semana',
      value: formatPrice(weekSales),
      subValue: '+8.2% vs semana anterior',
      icon: (
        <svg className={styles.iconAccent} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'Órdenes Pendientes',
      value: pendingOrders,
      subValue: 'Requieren atención',
      icon: (
        <svg className={styles.iconSlate} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Stock Bajo',
      value: lowStockCount,
      subValue: 'Reposición necesaria',
      icon: (
        <svg className={lowStockCount > 0 ? styles.iconDanger : styles.iconSlate} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ], [todaySales, weekSales, pendingOrders, lowStockCount]);

  if (isLoading) {
    return (
      <div className={styles.statsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonLineShort} />
            <div className={styles.skeletonLineMedium} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <GridContainer columns={4} gap="3">
      <div ref={cardsRef} className={styles.statsGridInner}>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </GridContainer>
  );
}
