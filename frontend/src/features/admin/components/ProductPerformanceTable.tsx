/**
 * ProductPerformanceTable - Table showing product performance metrics
 */
import { useState, useMemo } from 'react';
import type { TopProduct } from '../../../types/analytics.types';
import styles from './ProductPerformanceTable.module.css';

interface ProductPerformanceTableProps {
  products: TopProduct[];
  isLoading?: boolean;
}

type SortField = 'name' | 'totalSold' | 'revenue';
type SortOrder = 'asc' | 'desc';

export function ProductPerformanceTable({ products, isLoading }: ProductPerformanceTableProps) {
  const [sortField, setSortField] = useState<SortField>('totalSold');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedProducts = useMemo(() => {
    let filtered = products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'totalSold') {
        comparison = a.totalSold - b.totalSold;
      } else if (sortField === 'revenue') {
        comparison = a.revenue - b.revenue;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [products, searchTerm, sortField, sortOrder]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return (
      <span className={styles.sortIcon}>
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.skeletonContainer}>
        <div className={styles.skeletonContent}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      {/* Search and Filters */}
      <div className={styles.tableHeader}>
        <div className={styles.searchContainer}>
          <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button className={styles.exportButton}>
          <svg className={styles.exportIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHeaderRow}>
            <tr>
              <th className={styles.tableHeaderCell}>
                Producto
              </th>
              <th
                className={`${styles.tableHeaderCell} ${styles.tableHeaderCellSortable}`}
                onClick={() => handleSort('totalSold')}
              >
                Vendidos <SortIcon field="totalSold" />
              </th>
              <th
                className={`${styles.tableHeaderCell} ${styles.tableHeaderCellSortable}`}
                onClick={() => handleSort('revenue')}
              >
                Ingresos <SortIcon field="revenue" />
              </th>
              <th className={styles.tableHeaderCell}>
                Rendimiento
              </th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {sortedProducts.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyCell}>
                  No se encontraron productos
                </td>
              </tr>
            ) : (
              sortedProducts.map((product) => {
                const maxRevenue = Math.max(...products.map(p => p.revenue), 1);
                const performance = (product.revenue / maxRevenue) * 100;

                return (
                  <tr key={product.productId} className={styles.tableRow}>
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
                      <span className={`${styles.valueText} ${styles.valueBold}`}>
                        ${product.revenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.performanceContainer}>
                        <div className={styles.performanceBar}>
                          <div
                            className={styles.performanceFill}
                            style={{ width: `${performance}%` }}
                          />
                        </div>
                        <span className={styles.performanceValue}>
                          {performance.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}