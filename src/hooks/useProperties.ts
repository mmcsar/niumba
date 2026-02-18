// Niumba - Properties Hook
import { useState, useEffect, useCallback } from 'react';
import {
  getProperties,
  getPropertyById,
  getFeaturedProperties,
  getPropertiesByCity,
  getPropertiesByType,
  searchProperties,
  getNearbyProperties,
  type PropertyFilters,
  type PropertyListOptions,
} from '../services/propertyService';
import { Property } from '../types';
import { devLog, errorLog } from '../utils/logHelper';
import { cache, CACHE_TTL } from '../services/cacheService';

/**
 * Hook to fetch properties with filters and pagination
 */
export const useProperties = (options: PropertyListOptions = {}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(options.page || 0);

  const loadProperties = useCallback(async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const currentPage = reset ? 0 : page;
      const { data, count: totalCount } = await getProperties({
        ...options,
        page: currentPage,
      });

      if (reset) {
        setProperties(data);
        setPage(0);
      } else {
        setProperties((prev) => [...prev, ...data]);
      }

      setCount(totalCount);
      const pageSize = options.pageSize || 20;
      setHasMore(data.length === pageSize && totalCount > (currentPage + 1) * pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des propriétés');
    } finally {
      setLoading(false);
    }
  }, [options, page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      loadProperties(false);
    }
  }, [loading, hasMore, loadProperties]);

  useEffect(() => {
    loadProperties(true);
  }, [options.filters?.city, options.filters?.type, options.filters?.priceType, options.filters?.search]);

  const refresh = useCallback(() => {
    setPage(0);
    loadProperties(true);
  }, [loadProperties]);

  return {
    properties,
    loading,
    error,
    hasMore: hasMore ?? false, // Ensure hasMore is always defined
    count,
    loadMore: loadMore || (() => {}), // Ensure loadMore is always defined
    refresh,
  };
};

/**
 * Hook to fetch a single property
 */
export const useProperty = (propertyId: string | null) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProperty = useCallback(async () => {
    if (!propertyId) {
      setProperty(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getPropertyById(propertyId);
      setProperty(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la propriété');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  return {
    property,
    loading,
    error,
    refresh: loadProperty,
  };
};

/**
 * Hook to fetch featured properties
 */
export const useFeaturedProperties = (limit: number = 6) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeatured = useCallback(async () => {
    // Check cache first (2 minutes TTL for featured properties)
    const cacheKey = `featured_properties_${limit}`;
    const cached = await cache.get<Property[]>(cacheKey);
    if (cached) {
      setProperties(cached);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      devLog(`[useFeaturedProperties] Loading ${limit} featured properties...`);
      const data = await getFeaturedProperties(limit);
      devLog(`[useFeaturedProperties] Loaded ${data.length} properties`);
      
      // Cache the result for 2 minutes
      await cache.set(cacheKey, data, CACHE_TTL.SHORT);
      
      setProperties(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      errorLog('[useFeaturedProperties] Error loading featured properties', error, { limit });
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des propriétés');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  return {
    properties,
    loading,
    error,
    refresh: loadFeatured,
    hasMore: false, // Featured properties don't have pagination
    loadMore: () => {}, // No-op for featured properties
  };
};

/**
 * Hook to search properties
 */
export const usePropertySearch = (query: string, options: PropertyListOptions = {}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [count, setCount] = useState(0);

  const search = useCallback(async (searchQuery: string, reset: boolean = true) => {
    if (!searchQuery.trim()) {
      setProperties([]);
      setHasMore(false);
      setCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Use functional update to get current properties length
      let currentLength = 0;
      setProperties((prev) => {
        currentLength = prev.length;
        return prev;
      });

      const { data, count: totalCount } = await searchProperties(searchQuery, {
        ...options,
        page: reset ? 0 : Math.floor(currentLength / (options.pageSize || 20)),
      });

      if (reset) {
        setProperties(data);
      } else {
        setProperties((prev) => [...prev, ...data]);
      }

      setCount(totalCount);
      const pageSize = options.pageSize || 20;
      const newLength = reset ? data.length : currentLength + data.length;
      setHasMore(data.length === pageSize && totalCount > newLength);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    if (query) {
      search(query, true);
    } else {
      setProperties([]);
      setHasMore(false);
      setCount(0);
    }
  }, [query, search]);

  return {
    properties,
    loading,
    error,
    hasMore: hasMore ?? false, // Ensure hasMore is always defined
    count,
    search,
    loadMore: () => {}, // No-op for search
  };
};

/**
 * Hook to fetch nearby properties
 */
export const useNearbyProperties = (
  latitude: number | null,
  longitude: number | null,
  radiusKm: number = 10
) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNearby = useCallback(async () => {
    if (latitude === null || longitude === null) {
      setProperties([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getNearbyProperties(latitude, longitude, radiusKm);
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des propriétés');
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, radiusKm]);

  useEffect(() => {
    loadNearby();
  }, [loadNearby]);

  return {
    properties,
    loading,
    error,
    refresh: loadNearby,
    hasMore: false, // Nearby properties don't have pagination
    loadMore: () => {}, // No-op for nearby properties
  };
};

export default useProperties;
