/**
 * ProductList — Premium product catalog with responsive grid,
 * crossfade hover cards, filter sidebar, and pagination.
 */

import { useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProductStore } from '@store/productStore';
import { useCartStore } from '@store/cartStore';
import { useToastStore } from '@store/toastStore';
import type { Product, ProductFilters } from '../../../types/product.types';
import { formatPrice } from '@utils/formatPrice';
import { SEO } from '@components/SEO';
import { LazyImage } from '@components/LazyImage';
import { useGSAPAnimation } from '@hooks/useGSAPAnimation';
import { FilterSidebar } from '@features/shop/components/FilterSidebar';
import styles from './ProductList.module.css';

// ─── Skeleton ─────────────────────────────────────────────
function ProductCardSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonPrice} />
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────
interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const { addItem } = useCartStore();
  const toast = useToastStore();

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const secondaryImage = product.images.length > 1
    ? product.images.find((img) => img.id !== primaryImage?.id) || product.images[1]
    : null;

  const cardRef = useRef<HTMLAnchorElement>(null);
  const primaryRef = useRef<HTMLDivElement>(null);
  const secondaryRef = useRef<HTMLDivElement>(null);
  const { crossfadeHover } = useGSAPAnimation();

  // Crossfade hover effect
  useEffect(() => {
    if (!secondaryImage || !primaryRef.current || !secondaryRef.current) return;

    const cleanup = crossfadeHover({
      primaryTarget: primaryRef.current,
      secondaryTarget: secondaryRef.current,
      duration: 0.3,
    });

    return () => {
      cleanup?.();
    };
  }, [secondaryImage, crossfadeHover]);

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (product.stock <= 0) return;

      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: primaryImage?.url,
      });

      toast.success(t('shop.addedToCart'));
    },
    [product, primaryImage, addItem, t, toast],
  );

  return (
    <Link
      to={`/products/${product.slug}`}
      className={styles.productCard}
      data-animate="true"
      ref={cardRef}
    >
      <div className={styles.productCardImage}>
        {/* Primary image */}
        <div ref={primaryRef} className={styles.cardImagePrimary}>
          {primaryImage ? (
            <LazyImage
              src={primaryImage.url}
              alt={product.name}
              className={styles.cardImage}
            />
          ) : (
            <div className={styles.cardImagePlaceholder}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Secondary image (for crossfade) */}
        {secondaryImage && (
          <div ref={secondaryRef} className={styles.cardImageSecondary}>
            <LazyImage
              src={secondaryImage.url}
              alt={`${product.name} - vista alternativa`}
              className={styles.cardImage}
            />
          </div>
        )}

        {!product.isActive && (
          <div className={styles.productBadge}>{t('shop.outOfStock')}</div>
        )}

        {/* Add to cart overlay button */}
        <button
          className={styles.cardAddBtn}
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          aria-label={`${t('shop.addToCart')} ${product.name}`}
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
          </svg>
        </button>
      </div>

      <div className={styles.productCardContent}>
        {product.category && (
          <p className={styles.productCategory}>{product.category.name}</p>
        )}
        <h3 className={styles.productName}>{product.name}</h3>
        <p className={styles.productPrice}>{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

// ─── Sort Dropdown ─────────────────────────────────────────
interface SortDropdownProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

function SortDropdown({ value, onChange }: SortDropdownProps) {
  const { t } = useTranslation();

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || undefined)}
      className={styles.sortDropdown}
      aria-label={t('shop.sortBy')}
    >
      <option value="">{t('shop.sortBy')}</option>
      <option value="price_asc">{t('shop.sortPriceAsc')}</option>
      <option value="price_desc">{t('shop.sortPriceDesc')}</option>
      <option value="name_asc">{t('shop.sortNameAsc')}</option>
      <option value="name_desc">{t('shop.sortNameDesc')}</option>
      <option value="newest">{t('shop.sortNewest')}</option>
    </select>
  );
}

// ─── Pagination ───────────────────────────────────────────
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <nav className={styles.pagination} aria-label="Paginación">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.pageButton}
        aria-label={t('shop.previous')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {t('shop.previous')}
      </button>

      {startPage > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className={styles.pageButton}>
            1
          </button>
          {startPage > 2 && <span className={styles.ellipsis}>...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${styles.pageButton} ${page === currentPage ? styles.pageButtonActive : ''}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className={styles.ellipsis}>...</span>}
          <button onClick={() => onPageChange(totalPages)} className={styles.pageButton}>
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.pageButton}
        aria-label={t('shop.next')}
      >
        {t('shop.next')}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </nav>
  );
}

// ─── Main ProductList ──────────────────────────────────────
export default function ProductList() {
  const { t } = useTranslation();
  const {
    products,
    categories,
    filters,
    pagination,
    isLoading,
    error,
    fetchProducts,
    fetchCategories,
    setFilters,
    setPage,
  } = useProductStore();

  const gridRef = useRef<HTMLDivElement>(null);
  const { staggerIn } = useGSAPAnimation();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stagger animation when products load
  useEffect(() => {
    if (!isLoading && products.length > 0 && gridRef.current) {
      const cards = gridRef.current.querySelectorAll('[data-animate="true"]');
      if (cards.length > 0) {
        staggerIn({ targets: cards, stagger: 0.06 });
      }
    }
  }, [isLoading, products, staggerIn]);

  const handleCategoryChange = (slug: string | undefined) => {
    setFilters({ categorySlug: slug });
  };

  const handlePriceChange = (min: number | undefined, max: number | undefined) => {
    setFilters({ minPrice: min, maxPrice: max });
  };

  const handleSortChange = (sortBy: string | undefined) => {
    setFilters({ sortBy: sortBy as ProductFilters['sortBy'] });
  };

  const [searchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const canonicalPath = `/products${queryString ? `?${queryString}` : ''}`;

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <svg className={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className={styles.errorTitle}>{t('shop.errorTitle')}</h2>
            <p className={styles.errorText}>{error}</p>
            <button onClick={() => fetchProducts()} className={styles.retryButton}>
              {t('shop.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={t('shop.catalogTitle')}
        description={t('shop.catalogDescription')}
        pathname={canonicalPath}
      />
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>{t('shop.catalogTitle')}</h1>

          {/* Mobile Filter Toggle + Sort + Results */}
          <div className={styles.toolbar}>
            <FilterSidebar
              categories={categories}
              selectedCategory={filters.categorySlug}
              minPrice={filters.minPrice}
              maxPrice={filters.maxPrice}
              onCategoryChange={handleCategoryChange}
              onPriceChange={handlePriceChange}
            />
            <div className={styles.toolbarRight}>
              <p className={styles.resultsText}>
                {isLoading
                  ? t('shop.loadingProducts')
                  : t('shop.productsFound', { count: pagination.total })}
              </p>
              <SortDropdown value={filters.sortBy} onChange={handleSortChange} />
            </div>
          </div>

          <div className={styles.mainContent}>
            {/* Desktop Filter Sidebar */}
            <div className={styles.sidebarContainer}>
              <FilterSidebar
                categories={categories}
                selectedCategory={filters.categorySlug}
                minPrice={filters.minPrice}
                maxPrice={filters.maxPrice}
                onCategoryChange={handleCategoryChange}
                onPriceChange={handlePriceChange}
              />
            </div>

            {/* Products Grid */}
            <div className={styles.productsContainer}>
              {isLoading ? (
                <div className={styles.productsGrid}>
                  {[...Array(8)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className={styles.emptyTitle}>{t('shop.noProducts')}</h3>
                  <p className={styles.emptyText}>{t('shop.noProductsHint')}</p>
                </div>
              ) : (
                <div className={styles.productsGrid} ref={gridRef} role="list">
                  {products.map((product) => (
                    <div key={product.id} role="listitem">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && products.length > 0 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
