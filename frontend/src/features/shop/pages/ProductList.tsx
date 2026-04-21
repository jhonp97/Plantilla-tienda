/**
 * ProductList - Public product catalog with filters and pagination
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProductStore } from '../../../store/productStore';
import type { Category, Product, ProductFilters } from '../../../types/product.types';
import styles from './ProductList.module.css';

// Skeleton component for loading state
function ProductCardSkeleton() {
  return (
    <div className={`${styles.skeleton} ${styles.animatePulse}`}>
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonSubtitle} />
        <div className={styles.skeletonPrice} />
      </div>
    </div>
  );
}

// Product Card Component
interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  
  return (
    <Link
      to={`/products/${product.slug}`}
      className={styles.productCard}
    >
      <div className={styles.productCardImage}>
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={product.name}
            className={styles.productImage}
          />
        ) : (
          <div className={styles.productImagePlaceholder}>
            <svg className={styles.iconXl} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {!product.isActive && (
          <div className={styles.productBadge}>
            Agotado
          </div>
        )}
      </div>
      <div className={styles.productCardContent}>
        <h3 className={styles.productName}>
          {product.name}
        </h3>
        {product.category && (
          <p className={styles.productCategory}>{product.category.name}</p>
        )}
        <div className={styles.productPriceRow}>
          <span className={styles.productPrice}>
            ${product.price.toFixed(2)}
          </span>
          <span className={styles.productStock}>
            {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
          </span>
        </div>
        <button className={styles.productButton}>
          Ver detalle
        </button>
      </div>
    </Link>
  );
}

// Filter Sidebar Component
interface FilterSidebarProps {
  categories: Category[];
  selectedCategory: string | undefined;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  onCategoryChange: (slug: string | undefined) => void;
  onPriceChange: (min: number | undefined, max: number | undefined) => void;
}

function FilterSidebar({
  categories,
  selectedCategory,
  minPrice,
  maxPrice,
  onCategoryChange,
  onPriceChange,
}: FilterSidebarProps) {
  const [localMinPrice, setLocalMinPrice] = useState(minPrice?.toString() || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice?.toString() || '');

  const handlePriceApply = () => {
    const min = localMinPrice ? parseFloat(localMinPrice) : undefined;
    const max = localMaxPrice ? parseFloat(localMaxPrice) : undefined;
    onPriceChange(min, max);
  };

  return (
    <aside className={styles.filterSidebar}>
      <h2 className={styles.filterTitle}>Filtros</h2>
      
      {/* Categories Filter */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterSectionTitle}>Categorías</h3>
        <div className={styles.filterOptions}>
          <label className={styles.filterLabel}>
            <input
              type="radio"
              name="category"
              checked={!selectedCategory}
              onChange={() => onCategoryChange(undefined)}
              className={styles.filterInput}
            />
            <span>Todas</span>
          </label>
          {categories && categories.map((category) => (
            <label key={category.id} className={styles.filterLabel}>
              <input
                type="radio"
                name="category"
                checked={selectedCategory === category.slug}
                onChange={() => onCategoryChange(category.slug)}
                className={styles.filterInput}
              />
              <span>{category.name}</span>
              {category.productCount !== undefined && (
                <span className={styles.filterCount}>
                  ({category.productCount})
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterSectionTitle}>Precio</h3>
        <div className={styles.priceInputs}>
          <input
            type="number"
            placeholder="Min"
            value={localMinPrice}
            onChange={(e) => setLocalMinPrice(e.target.value)}
            className={styles.priceInput}
          />
          <span className={styles.priceSeparator}>-</span>
          <input
            type="number"
            placeholder="Max"
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
            className={styles.priceInput}
          />
        </div>
        <button
          onClick={handlePriceApply}
          className={styles.applyButton}
        >
          Aplicar
        </button>
      </div>
    </aside>
  );
}

// Sort Dropdown Component
interface SortDropdownProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || undefined)}
      className={styles.sortDropdown}
    >
      <option value="">Ordenar por...</option>
      <option value="price_asc">Precio: Menor a Mayor</option>
      <option value="price_desc">Precio: Mayor a Menor</option>
      <option value="name_asc">Nombre: A-Z</option>
      <option value="name_desc">Nombre: Z-A</option>
      <option value="newest">Más recientes</option>
    </select>
  );
}

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
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
    <div className={styles.pagination}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.pageButton}
      >
        Anterior
      </button>
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={styles.pageButton}
          >
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
        >
          {page}
        </button>
      ))}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className={styles.ellipsis}>...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className={styles.pageButton}
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.pageButton}
      >
        Siguiente
      </button>
    </div>
  );
}

// Main ProductList Component
export default function ProductList() {
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

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const handleCategoryChange = (slug: string | undefined) => {
    setSelectedCategory(slug);
    setFilters({ categorySlug: slug });
  };

  const handlePriceChange = (min: number | undefined, max: number | undefined) => {
    setMinPrice(min);
    setMaxPrice(max);
    setFilters({ minPrice: min, maxPrice: max });
  };

  const handleSortChange = (sortBy: string | undefined) => {
    setFilters({ sortBy: sortBy as ProductFilters['sortBy'] });
  };

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <svg className={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className={styles.errorTitle}>Error</h2>
          <p className={styles.errorText}>{error}</p>
          <button
            onClick={() => fetchProducts()}
            className={styles.retryButton}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Catálogo de Productos</h1>
        
        <div className={styles.mainContent}>
          {/* Filters Sidebar */}
          <div className={styles.sidebarContainer}>
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onCategoryChange={handleCategoryChange}
              onPriceChange={handlePriceChange}
            />
          </div>

          {/* Products Grid */}
          <div className={styles.productsContainer}>
            {/* Sort and Results Info */}
            <div className={styles.headerRow}>
              <p className={styles.resultsText}>
                {isLoading ? 'Cargando...' : `${pagination.total} productos encontrados`}
              </p>
              <SortDropdown value={filters.sortBy} onChange={handleSortChange} />
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className={styles.productsGrid}>
                {[...Array(8)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : !products || products.length === 0 ? (
              <div className={styles.emptyState}>
                <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className={styles.emptyTitle}>No se encontraron productos</h3>
                <p className={styles.emptyText}>Intenta ajustar los filtros para encontrar lo que buscas</p>
              </div>
            ) : (
              <div className={styles.productsGrid}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && products && products.length > 0 && (
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
  );
}