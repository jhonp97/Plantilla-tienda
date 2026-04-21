/**
 * AdminDashboardPage - Main dashboard with KPIs and charts
 */
import { useEffect } from 'react';
import { useAnalyticsStore } from '../../../store/analyticsStore';
import { DashboardStats } from '../components/DashboardStats';
import { SalesChart } from '../components/SalesChart';
import { LowStockAlert } from '../components/LowStockAlert';
import styles from './AdminDashboardPage.module.css';

export default function AdminDashboardPage() {
  const {
    overview,
    salesData,
    topProducts,
    lowStockProducts,
    todaySales,
    weekSales,
    pendingOrders,
    lowStockCount,
    isLoading,
    fetchOverview,
    fetchLowStockProducts,
  } = useAnalyticsStore();

  useEffect(() => {
    fetchOverview();
    fetchLowStockProducts();
  }, [fetchOverview, fetchLowStockProducts]);

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>Resumen de tu tienda en tiempo real</p>
        </div>
        <div className={styles.headerActions}>
          <select className={styles.timeFilter}>
            <option>Últimos 7 días</option>
            <option>Últimos 30 días</option>
            <option>Últimos 90 días</option>
          </select>
        </div>
      </div>

      {/* KPI Stats */}
      <DashboardStats
        todaySales={todaySales}
        weekSales={weekSales}
        pendingOrders={pendingOrders}
        lowStockCount={lowStockCount}
        isLoading={isLoading}
      />

      {/* Charts and Alerts Grid */}
      <div className={styles.contentGrid}>
        <div className={styles.chartSection}>
          <SalesChart data={salesData} isLoading={isLoading} />
        </div>
        <div className={styles.alertSection}>
          <LowStockAlert products={lowStockProducts} isLoading={isLoading} />
        </div>
      </div>

      {/* Top Products Today */}
      <div className={styles.topProductsSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Productos Más Vendidos</h3>
            <p className={styles.sectionSubtitle}>Top 10 productos por unidades vendidas</p>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.skeletonContainer}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={styles.skeletonRow} />
            ))}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>#</th>
                  <th className={styles.tableHeaderCell}>Producto</th>
                  <th className={styles.tableHeaderCell}>Vendidos</th>
                  <th className={styles.tableHeaderCell}>Ingresos</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {topProducts.slice(0, 10).map((product, index) => (
                  <tr key={product.productId} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <span className={styles.rowNumber}>{index + 1}</span>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.productInfo}>
                        <div className={styles.productImage}>
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className={styles.productImageImg} />
                          ) : (
                            <div className={styles.productImagePlaceholder}>
                              <svg className={styles.productImagePlaceholderIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className={styles.productName}>{product.name}</span>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={styles.valueText}>{product.totalSold}</span>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={styles.valueBold}>
                        ${product.revenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                ))}
                {topProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className={styles.emptyCell}>
                      No hay datos de productos disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}