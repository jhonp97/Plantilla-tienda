import { useEffect, useRef, useState, useCallback } from 'react';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  abort: () => void;
}

/**
 * useFetch - Generic fetch hook with AbortController cleanup.
 *
 * @param url - The URL to fetch
 * @param options - Optional fetch options (RequestInit)
 * @returns { data, loading, error, refetch, abort }
 */
export function useFetch<T = unknown>(
  url: string,
  options?: RequestInit
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const fetchIdRef = useRef(0);

  const executeFetch = useCallback(() => {
    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentFetchId = ++fetchIdRef.current;

    setLoading(true);
    setError(null);

    fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: 'include',
    })
      .then(async (response) => {
        if (!mountedRef.current || currentFetchId !== fetchIdRef.current) return;

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const message =
            body?.message ||
            body?.error ||
            `HTTP ${response.status}: ${response.statusText}`;
          throw new Error(message);
        }

        return response.json();
      })
      .then((result) => {
        if (!mountedRef.current || currentFetchId !== fetchIdRef.current) return;
        // Handle { success: true, data: ... } or direct data
        const payload = result?.success === true ? result.data : result;
        setData(payload as T);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        if (!mountedRef.current || currentFetchId !== fetchIdRef.current) return;
        setError(err.message || 'Error de conexión');
        setLoading(false);
      });
  }, [url, options]);

  useEffect(() => {
    mountedRef.current = true;
    executeFetch();

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [executeFetch]);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const refetch = useCallback(() => {
    executeFetch();
  }, [executeFetch]);

  return { data, loading, error, refetch, abort };
}
