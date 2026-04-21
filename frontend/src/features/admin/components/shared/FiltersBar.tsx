import { ReactNode } from 'react';
import styles from './FiltersBar.module.css';

interface FilterConfig {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface ActiveFilter {
  key: string;
  label: string;
  onRemove: () => void;
}

interface FiltersBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  activeFilters?: ActiveFilter[];
  onFilterChange?: (key: string, value: string) => void;
  onClearFilters?: () => void;
  children?: ReactNode;
}

export function FiltersBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  children,
}: FiltersBarProps) {
  const hasActiveFilters = activeFilters && activeFilters.length > 0;

  return (
    <div className={styles.filtersBar}>
      <div className={styles.filtersRow}>
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={styles.searchInput}
          />
        </div>

        {filters &&
          filters.map((filter) => (
            <select
              key={filter.key}
              className={styles.filterSelect}
              onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}

        {children}
      </div>

      {hasActiveFilters && (
        <div className={styles.activeFilters}>
          {activeFilters!.map((filter) => (
            <span key={filter.key} className={styles.filterChip}>
              {filter.label}
              <button
                type="button"
                onClick={filter.onRemove}
                className={styles.filterChipRemove}
              >
                <svg width="0.75rem" height="0.75rem" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className={styles.clearFiltersButton}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default FiltersBar;
