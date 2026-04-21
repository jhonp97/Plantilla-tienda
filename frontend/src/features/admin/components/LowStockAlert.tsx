/**
 * LowStockAlert - Alert component for low stock products
 */
import { useNavigate } from 'react-router-dom';
import type { TopProduct } from '../../../types/analytics.types';
import styles from './LowStockAlert.module.css';

interface LowStockAlertProps {
  products: TopProduct[];
  isLoading?: boolean;
}

export function LowStockAlert({ products, isLoading }: LowStockAlertProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className={styles.skeletonCard}>
        <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
        <div className={styles.skeletonList}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonItem} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.alertCard}>
      <div className={styles.alertHeader}>
        <div className={styles.alertHeaderLeft}>
          <div className={styles.alertIconContainer}>
            <svg className={styles.alertIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className={styles.alertTitle}>Stock Bajo</h3>
            <p className={styles.alertSubtitle}>Productos que requieren reposición</p>
          </div>
        </div>
        <span className={styles.alertBadge}>
          {products.length} items
        </span>
      </div>

      {products.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconContainer}>
            <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className={styles.emptyText}>¡Todo el stock está saludable!</p>
        </div>
      ) : (
        <div className={styles.productList}>
          {products.slice(0, 5).map((product) => (
            <div
              key={product.productId}
              className={styles.productItem}
              onClick={() => navigate(`/dashboard/products/${product.productId}/edit`)}
            >
              <div className={styles.productLeft}>
                <div className={styles.productImageContainer}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className={styles.productImage}
                    />
                  ) : (
                    <svg className={styles.productImagePlaceholder} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                </div>
                <div className={styles.productInfo}>
                  <p className={styles.productName}>{product.name}</p>
                  <p className={styles.productSold}>
                    Vendidos: {product.totalSold} unidades
                  </p>
                </div>
              </div>
              <div className={styles.productArrow}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {products.length > 5 && (
        <button
          onClick={() => navigate('/dashboard/products?filter=low-stock')}
          className={styles.viewAllLink}
        >
          Ver todos los {products.length} productos
        </button>
      )}
    </div>
  );
}