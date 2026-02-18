// Niumba - Infinite Pagination Hook
// High-performance infinite scrolling with caching and prefetching

import { useState, useCallback, useRef, useEffect } from 'react';
import { cache, CACHE_TTL } from '../services/cacheService';

interface PaginationConfig<T> {
  // Function to fetch data
  fetchFn: (page: number, pageSize: number) => Promise<T[]>;
  // Unique key for caching
  cacheKey: string;
  // Items per page
  pageSize?: number;
  // Cache TTL
  cacheTTL?: number;
  // Enable prefetching
  prefetch?: boolean;
  // Number of pages to prefetch
  prefetchPages?: number;
  // Initial data
  initialData?: T[];
  // Transform data before storing
  transform?: (data: T[]) => T[];
  // Enable deduplication
  deduplicate?: boolean;
  // Key extractor for deduplication
  keyExtractor?: (item: T) => string;
}

interface PaginationState<T> {
  data: T[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  page: number;
  totalLoaded: number;
}

interface PaginationActions {
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
  prefetchNext: () => Promise<void>;
}

export function useInfinitePagination<T>(
  config: PaginationConfig<T>
): PaginationState<T> & PaginationActions {
  const {
    fetchFn,
    cacheKey,
    pageSize = 20,
    cacheTTL = CACHE_TTL.MEDIUM,
    prefetch = true,
    prefetchPages = 1,
    initialData = [],
    transform,
    deduplicate = true,
    keyExtractor = (item: any) => item.id,
  } = config;

  const [state, setState] = useState<PaginationState<T>>({
    data: initialData,
    isLoading: initialData.length === 0,
    isRefreshing: false,
    isLoadingMore: false,
    hasMore: true,
    error: null,
    page: 0,
    totalLoaded: initialData.length,
  });

  const isMounted = useRef(true);
  const isLoadingRef = useRef(false);
  const prefetchedPages = useRef<Set<number>>(new Set());

  // Deduplicate data
  const deduplicateData = useCallback(
    (newData: T[], existingData: T[]): T[] => {
      if (!deduplicate) return [...existingData, ...newData];

      const existingKeys = new Set(existingData.map(keyExtractor));
      const uniqueNewData = newData.filter(
        (item) => !existingKeys.has(keyExtractor(item))
      );

      return [...existingData, ...uniqueNewData];
    },
    [deduplicate, keyExtractor]
  );

  // Fetch a specific page
  const fetchPage = useCallback(
    async (page: number, useCache: boolean = true): Promise<T[]> => {
      const pageCacheKey = `${cacheKey}_page_${page}`;

      // Try cache first
      if (useCache) {
        const cached = await cache.get<T[]>(pageCacheKey);
        if (cached) {
          return transform ? transform(cached) : cached;
        }
      }

      // Fetch from API
      const data = await fetchFn(page, pageSize);
      const transformedData = transform ? transform(data) : data;

      // Cache the result
      await cache.set(pageCacheKey, transformedData, cacheTTL);

      return transformedData;
    },
    [cacheKey, fetchFn, pageSize, cacheTTL, transform]
  );

  // Load initial data
  const loadInitial = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await fetchPage(0);

      if (isMounted.current) {
        setState((prev) => ({
          ...prev,
          data,
          isLoading: false,
          hasMore: data.length === pageSize,
          page: 0,
          totalLoaded: data.length,
        }));

        // Prefetch next pages
        if (prefetch && data.length === pageSize) {
          prefetchNext();
        }
      }
    } catch (error) {
      if (isMounted.current) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error as Error,
        }));
      }
    } finally {
      isLoadingRef.current = false;
    }
  }, [fetchPage, pageSize, prefetch]);

  // Load more data
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !state.hasMore) return;
    isLoadingRef.current = true;

    setState((prev) => ({ ...prev, isLoadingMore: true }));

    try {
      const nextPage = state.page + 1;
      const data = await fetchPage(nextPage);

      if (isMounted.current) {
        setState((prev) => ({
          ...prev,
          data: deduplicateData(data, prev.data),
          isLoadingMore: false,
          hasMore: data.length === pageSize,
          page: nextPage,
          totalLoaded: prev.totalLoaded + data.length,
        }));

        // Prefetch next pages
        if (prefetch && data.length === pageSize) {
          prefetchNext();
        }
      }
    } catch (error) {
      if (isMounted.current) {
        setState((prev) => ({
          ...prev,
          isLoadingMore: false,
          error: error as Error,
        }));
      }
    } finally {
      isLoadingRef.current = false;
    }
  }, [state.hasMore, state.page, fetchPage, pageSize, deduplicateData, prefetch]);

  // Refresh data
  const refresh = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    setState((prev) => ({ ...prev, isRefreshing: true, error: null }));

    try {
      // Clear cache for this key
      await cache.deletePattern(`${cacheKey}_page_`);
      prefetchedPages.current.clear();

      const data = await fetchPage(0, false);

      if (isMounted.current) {
        setState({
          data,
          isLoading: false,
          isRefreshing: false,
          isLoadingMore: false,
          hasMore: data.length === pageSize,
          error: null,
          page: 0,
          totalLoaded: data.length,
        });

        // Prefetch next pages
        if (prefetch && data.length === pageSize) {
          prefetchNext();
        }
      }
    } catch (error) {
      if (isMounted.current) {
        setState((prev) => ({
          ...prev,
          isRefreshing: false,
          error: error as Error,
        }));
      }
    } finally {
      isLoadingRef.current = false;
    }
  }, [cacheKey, fetchPage, pageSize, prefetch]);

  // Prefetch next pages
  const prefetchNext = useCallback(async () => {
    const startPage = state.page + 1;
    const endPage = startPage + prefetchPages;

    for (let page = startPage; page <= endPage; page++) {
      if (!prefetchedPages.current.has(page)) {
        prefetchedPages.current.add(page);
        // Prefetch in background without waiting
        fetchPage(page).catch(() => {
          prefetchedPages.current.delete(page);
        });
      }
    }
  }, [state.page, prefetchPages, fetchPage]);

  // Reset state
  const reset = useCallback(() => {
    prefetchedPages.current.clear();
    setState({
      data: [],
      isLoading: true,
      isRefreshing: false,
      isLoadingMore: false,
      hasMore: true,
      error: null,
      page: 0,
      totalLoaded: 0,
    });
  }, []);

  // Load initial data on mount
  useEffect(() => {
    isMounted.current = true;
    
    if (initialData.length === 0) {
      loadInitial();
    }

    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    ...state,
    loadMore,
    refresh,
    reset,
    prefetchNext,
  };
}

// Hook for paginated Supabase queries
export function useSupabasePagination<T>(
  tableName: string,
  options: {
    select?: string;
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    pageSize?: number;
    cacheKey?: string;
  } = {}
) {
  const {
    select = '*',
    filters = {},
    orderBy = { column: 'created_at', ascending: false },
    pageSize = 20,
    cacheKey = `supabase_${tableName}`,
  } = options;

  // Import supabase dynamically to avoid circular dependency
  const fetchFn = useCallback(
    async (page: number, size: number) => {
      const { supabase } = await import('../lib/supabase');
      
      let query = supabase
        .from(tableName)
        .select(select)
        .range(page * size, (page + 1) * size - 1)
        .order(orderBy.column, { ascending: orderBy.ascending ?? false });

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (typeof value === 'object' && value.operator) {
            // Handle special operators
            const { operator, val } = value;
            switch (operator) {
              case 'gte':
                query = query.gte(key, val);
                break;
              case 'lte':
                query = query.lte(key, val);
                break;
              case 'like':
                query = query.like(key, val);
                break;
              case 'ilike':
                query = query.ilike(key, val);
                break;
              default:
                query = query.eq(key, val);
            }
          } else {
            query = query.eq(key, value);
          }
        }
      });

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as T[];
    },
    [tableName, select, filters, orderBy]
  );

  // Generate cache key from filters
  const fullCacheKey = `${cacheKey}_${JSON.stringify(filters)}_${orderBy.column}_${orderBy.ascending}`;

  return useInfinitePagination<T>({
    fetchFn,
    cacheKey: fullCacheKey,
    pageSize,
    cacheTTL: CACHE_TTL.MEDIUM,
    prefetch: true,
    deduplicate: true,
  });
}

export default useInfinitePagination;

