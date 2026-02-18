// Niumba - Optimized Pagination Hook
// Pagination optimisée avec cache et préchargement
import { useState, useCallback, useRef, useEffect } from 'react';

interface UseOptimizedPaginationOptions<T> {
  initialData?: T[];
  pageSize?: number;
  initialPage?: number;
  preloadNext?: boolean; // Précharger la page suivante
  cachePages?: boolean; // Mettre en cache les pages chargées
}

interface PaginationState<T> {
  data: T[];
  currentPage: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  totalPages: number;
}

export const useOptimizedPagination = <T>(
  fetchFunction: (page: number, pageSize: number) => Promise<{ data: T[]; total?: number }>,
  options: UseOptimizedPaginationOptions<T> = {}
) => {
  const {
    initialData = [],
    pageSize = 20,
    initialPage = 0,
    preloadNext = true,
    cachePages = true,
  } = options;

  const [state, setState] = useState<PaginationState<T>>({
    data: initialData,
    currentPage: initialPage,
    hasMore: true,
    loading: false,
    error: null,
    totalPages: 0,
  });

  const cacheRef = useRef<Map<number, T[]>>(new Map());
  const loadingRef = useRef<Set<number>>(new Set());

  const loadPage = useCallback(
    async (page: number, append: boolean = false) => {
      // Vérifier le cache
      if (cachePages && cacheRef.current.has(page)) {
        const cachedData = cacheRef.current.get(page)!;
        setState((prev) => ({
          ...prev,
          data: append ? [...prev.data, ...cachedData] : cachedData,
          currentPage: page,
          hasMore: page < prev.totalPages - 1,
        }));
        return;
      }

      // Éviter les chargements multiples
      if (loadingRef.current.has(page)) return;
      loadingRef.current.add(page);

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const result = await fetchFunction(page, pageSize);
        const newData = result.data || [];
        const total = result.total || 0;
        const totalPages = Math.ceil(total / pageSize);

        // Mettre en cache
        if (cachePages) {
          cacheRef.current.set(page, newData);
        }

        setState((prev) => ({
          ...prev,
          data: append ? [...prev.data, ...newData] : newData,
          currentPage: page,
          hasMore: page < totalPages - 1,
          loading: false,
          totalPages,
        }));

        // Précharger la page suivante si demandé
        if (preloadNext && page < totalPages - 1) {
          const nextPage = page + 1;
          if (!loadingRef.current.has(nextPage) && !cacheRef.current.has(nextPage)) {
            // Précharger en arrière-plan
            fetchFunction(nextPage, pageSize).then((nextResult) => {
              if (cachePages && nextResult.data) {
                cacheRef.current.set(nextPage, nextResult.data);
              }
            });
          }
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Erreur de chargement',
        }));
      } finally {
        loadingRef.current.delete(page);
      }
    },
    [fetchFunction, pageSize, preloadNext, cachePages]
  );

  const loadNext = useCallback(() => {
    if (!state.loading && state.hasMore) {
      loadPage(state.currentPage + 1, true);
    }
  }, [state.loading, state.hasMore, state.currentPage, loadPage]);

  const refresh = useCallback(() => {
    cacheRef.current.clear();
    loadPage(0, false);
  }, [loadPage]);

  const reset = useCallback(() => {
    cacheRef.current.clear();
    loadingRef.current.clear();
    setState({
      data: initialData,
      currentPage: initialPage,
      hasMore: true,
      loading: false,
      error: null,
      totalPages: 0,
    });
  }, [initialData, initialPage]);

  // Charger la première page au montage
  useEffect(() => {
    if (initialData.length === 0) {
      loadPage(initialPage, false);
    }
  }, []);

  return {
    ...state,
    loadNext,
    refresh,
    reset,
    loadPage,
    clearCache: () => cacheRef.current.clear(),
  };
};

export default useOptimizedPagination;


