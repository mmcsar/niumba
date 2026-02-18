// Niumba - Region Hook (Optimized for Lualaba & Haut-Katanga)
import { useState, useEffect, useCallback } from 'react';
import {
  getRegions,
  getRegionStats,
  getPropertiesByRegion,
  getPopularRegions,
  searchRegions,
  type Region,
  type RegionStats,
} from '../services/regionService';

export const useRegions = (options: {
  province?: string;
  isActive?: boolean;
} = {}) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRegions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRegions(options);
      setRegions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(options)]);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  return { regions, loading, error, refresh: fetchRegions };
};

export const useRegionStats = (regionId: string) => {
  const [stats, setStats] = useState<RegionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!regionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRegionStats(regionId);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [regionId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
};

export const useRegionProperties = (
  regionId: string,
  options: {
    page?: number;
    pageSize?: number;
    status?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price' | 'created_at' | 'views';
    sortOrder?: 'asc' | 'desc';
  } = {}
) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(options.page || 0);

  const loadProperties = useCallback(
    async (reset: boolean = false) => {
      if (!regionId) return;
      
      setLoading(true);
      setError(null);
      
      const currentPage = reset ? 0 : page;
      
      try {
        const result = await getPropertiesByRegion(regionId, {
          ...options,
          page: currentPage,
        });

        if (reset) {
          setProperties(result.data);
          setPage(0);
        } else {
          setProperties((prev) => [...prev, ...result.data]);
        }

        setHasMore(result.hasMore);
        setCount(result.count);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur');
      } finally {
        setLoading(false);
      }
    },
    [regionId, JSON.stringify(options), page]
  );

  useEffect(() => {
    loadProperties(true);
  }, [regionId, JSON.stringify(options)]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      loadProperties(false);
    }
  }, [loading, hasMore, loadProperties]);

  const refresh = useCallback(() => {
    setPage(0);
    loadProperties(true);
  }, [loadProperties]);

  return {
    properties,
    loading,
    error,
    hasMore,
    count,
    loadMore,
    refresh,
  };
};

export const usePopularRegions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPopular = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPopularRegions();
      setRegions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPopular();
  }, [fetchPopular]);

  return { regions, loading, error, refresh: fetchPopular };
};

export const useRegionSearch = (searchTerm: string) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    if (!searchTerm || searchTerm.length < 2) {
      setRegions([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await searchRegions(searchTerm);
      setRegions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      search();
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [search]);

  return { regions, loading, error };
};


