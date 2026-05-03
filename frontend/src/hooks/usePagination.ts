import { useState, useCallback, useMemo } from 'react';

interface UsePaginationOptions {
  totalItems: number;
  pageSize?: number;
  initialPage?: number;
}

interface UsePaginationResult {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  startIndex: number;
  endIndex: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * usePagination - Hook for client-side pagination state.
 *
 * @param options.totalItems - Total number of items
 * @param options.pageSize - Items per page (default 10)
 * @param options.initialPage - Starting page (default 1)
 * @returns Pagination state and controls
 */
export function usePagination({
  totalItems,
  pageSize = 10,
  initialPage = 1,
}: UsePaginationOptions): UsePaginationResult {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / pageSize)),
    [totalItems, pageSize]
  );

  const clampedPage = useMemo(
    () => Math.min(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const startIndex = useMemo(
    () => (clampedPage - 1) * pageSize,
    [clampedPage, pageSize]
  );

  const endIndex = useMemo(
    () => Math.min(startIndex + pageSize, totalItems),
    [startIndex, pageSize, totalItems]
  );

  const hasNext = clampedPage < totalPages;
  const hasPrev = clampedPage > 1;

  const setPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  return {
    currentPage: clampedPage,
    totalPages,
    pageSize,
    setPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex,
    hasNext,
    hasPrev,
  };
}
