/**
 * FilterSidebar — Premium product filters sidebar with category
 * selection and price range. Responsive: sidebar on desktop,
 * collapsible section on mobile.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Category } from '../../../../types/product.types';
import styles from './FilterSidebar.module.css';

export interface FilterSidebarProps {
  categories: Category[];
  selectedCategory: string | undefined;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  onCategoryChange: (slug: string | undefined) => void;
  onPriceChange: (min: number | undefined, max: number | undefined) => void;
}

export function FilterSidebar({
  categories,
  selectedCategory,
  minPrice,
  maxPrice,
  onCategoryChange,
  onPriceChange,
}: FilterSidebarProps) {
  const { t } = useTranslation();
  const [localMinPrice, setLocalMinPrice] = useState(minPrice?.toString() || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice?.toString() || '');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handlePriceApply = () => {
    const min = localMinPrice ? parseFloat(localMinPrice) : undefined;
    const max = localMaxPrice ? parseFloat(localMaxPrice) : undefined;
    onPriceChange(min, max);
  };

  const handleClearFilters = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    onCategoryChange(undefined);
    onPriceChange(undefined, undefined);
  };

  const hasActiveFilters = selectedCategory || minPrice || maxPrice;

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className={styles.mobileToggle}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-expanded={isMobileOpen}
        aria-controls="filter-sidebar"
        type="button"
      >
        <svg
          className={styles.filterIcon}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span>{t('shop.filters')}</span>
        {hasActiveFilters && <span className={styles.activeDot} aria-hidden="true" />}
      </button>

      <aside
        id="filter-sidebar"
        className={`${styles.sidebar} ${isMobileOpen ? styles.sidebarOpen : ''}`}
        aria-label={t('shop.filters')}
      >
        <div className={styles.sidebarInner}>
          {/* Header */}
          <div className={styles.sidebarHeader}>
            <h2 className={styles.filterTitle}>{t('shop.filters')}</h2>
            {hasActiveFilters && (
              <button
                className={styles.clearBtn}
                onClick={handleClearFilters}
                type="button"
              >
                {t('common.clear')}
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div className={styles.filterSection}>
            <h3 className={styles.filterSectionTitle}>{t('shop.categories')}</h3>
            <div className={styles.filterOptions}>
              <label className={styles.filterLabel}>
                <input
                  type="radio"
                  name="category"
                  checked={!selectedCategory}
                  onChange={() => onCategoryChange(undefined)}
                  className={styles.filterInput}
                />
                <span className={styles.filterLabelText}>{t('shop.allCategories')}</span>
              </label>
              {categories.map((category) => (
                <label key={category.id} className={styles.filterLabel}>
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === category.slug}
                    onChange={() => onCategoryChange(category.slug)}
                    className={styles.filterInput}
                  />
                  <span className={styles.filterLabelText}>{category.name}</span>
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
            <h3 className={styles.filterSectionTitle}>{t('shop.price')}</h3>
            <div className={styles.priceInputs}>
              <input
                type="number"
                placeholder={t('shop.minPrice')}
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                className={styles.priceInput}
                aria-label={t('shop.minPrice')}
              />
              <span className={styles.priceSeparator}>–</span>
              <input
                type="number"
                placeholder={t('shop.maxPrice')}
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                className={styles.priceInput}
                aria-label={t('shop.maxPrice')}
              />
            </div>
            <button
              onClick={handlePriceApply}
              className={styles.applyButton}
              type="button"
            >
              {t('shop.apply')}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default FilterSidebar;
