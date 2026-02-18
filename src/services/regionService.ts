// Niumba - Region Service (Lualaba & Haut-Katanga)
// Optimized service for high-volume regions
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { cache, CACHE_TTL } from './cacheService';
import { errorLog } from '../utils/logHelper';

export interface Region {
  id: string;
  name: string;
  name_en: string;
  code: string;
  province: string;
  population?: number;
  is_active: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface RegionStats {
  total_properties: number;
  active_properties: number;
  total_agents: number;
  total_inquiries: number;
  average_price: number;
  price_range: {
    min: number;
    max: number;
  };
}

// Regions configuration for Lualaba & Haut-Katanga
export const REGIONS_CONFIG = {
  LUALABA: {
    code: 'LUA',
    name: 'Lualaba',
    cities: ['Kolwezi', 'Likasi', 'Kambove', 'Fungurume'],
    coordinates: {
      latitude: -10.7167,
      longitude: 25.4667,
    },
  },
  HAUT_KATANGA: {
    code: 'HK',
    name: 'Haut-Katanga',
    cities: ['Lubumbashi', 'Kipushi', 'Kakanda', 'Kasenga'],
    coordinates: {
      latitude: -11.6642,
      longitude: 27.4828,
    },
  },
};

/**
 * Get all regions with caching
 */
export const getRegions = async (options: {
  province?: string;
  isActive?: boolean;
  includeStats?: boolean;
} = {}): Promise<Region[]> => {
  if (!isSupabaseConfigured()) return [];

  const cacheKey = `regions_${JSON.stringify(options)}`;
  
  // Check cache first
  const cached = await cache.get<Region[]>(cacheKey);
  if (cached) return cached;

  try {
    let query = supabase
      .from('cities')
      .select('*')
      .order('name', { ascending: true });

    if (options.province) {
      query = query.eq('province', options.province);
    }

    if (options.isActive !== undefined) {
      query = query.eq('is_active', options.isActive);
    }

    const { data, error } = await query;

    if (error) {
      errorLog('Error fetching regions', error instanceof Error ? error : new Error(String(error)), { errorDetails: error });
      return [];
    }

    const regions: Region[] = (data || []).map((city: any) => ({
      id: city.id,
      name: city.name,
      name_en: city.name_en || city.name,
      code: city.code || '',
      province: city.province || '',
      population: city.population,
      is_active: city.is_active ?? true,
      coordinates: city.coordinates || undefined,
    }));

    // Cache for 1 hour (regions don't change often)
    await cache.set(cacheKey, regions, CACHE_TTL.HOUR);

    return regions;
  } catch (error) {
    errorLog('Error in getRegions', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
};

/**
 * Get region statistics (optimized for high volume)
 */
export const getRegionStats = async (
  regionId: string,
  useCache: boolean = true
): Promise<RegionStats | null> => {
  if (!isSupabaseConfigured()) return null;

  const cacheKey = `region_stats_${regionId}`;

  if (useCache) {
    const cached = await cache.get<RegionStats>(cacheKey);
    if (cached) return cached;
  }

  try {
    // Use parallel queries for better performance
    const [propertiesRes, agentsRes, inquiriesRes, pricesRes] = await Promise.all([
      // Total and active properties
      supabase
        .from('properties')
        .select('id, status, price', { count: 'exact', head: false })
        .eq('city_id', regionId),
      
      // Active agents
      supabase
        .from('agents')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      
      // Total inquiries
      supabase
        .from('inquiries')
        .select('id', { count: 'exact', head: true })
        .eq('property_id', regionId), // This might need adjustment based on schema
      
      // Price range
      supabase
        .from('properties')
        .select('price')
        .eq('city_id', regionId)
        .eq('status', 'active')
        .order('price', { ascending: true }),
    ]);

    const totalProperties = propertiesRes.count || 0;
    const activeProperties = (propertiesRes.data || []).filter(
      (p: any) => p.status === 'active'
    ).length;
    const totalAgents = agentsRes.count || 0;
    const totalInquiries = inquiriesRes.count || 0;

    // Calculate price statistics
    const prices = (pricesRes.data || []).map((p: any) => p.price || 0).filter((p: number) => p > 0);
    const averagePrice = prices.length > 0
      ? prices.reduce((sum, price) => sum + price, 0) / prices.length
      : 0;
    const priceRange = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    };

    const stats: RegionStats = {
      total_properties: totalProperties,
      active_properties: activeProperties,
      total_agents: totalAgents,
      total_inquiries: totalInquiries,
      average_price: Math.round(averagePrice),
      price_range: priceRange,
    };

    // Cache for 15 minutes (stats change frequently)
    await cache.set(cacheKey, stats, CACHE_TTL.MEDIUM);

    return stats;
  } catch (error) {
    errorLog('Error fetching region stats', error instanceof Error ? error : new Error(String(error)), { regionId });
    return null;
  }
};

/**
 * Get properties by region with optimized pagination
 */
export const getPropertiesByRegion = async (
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
): Promise<{ data: any[]; count: number; hasMore: boolean }> => {
  if (!isSupabaseConfigured()) {
    return { data: [], count: 0, hasMore: false };
  }

  const page = options.page || 0;
  const pageSize = options.pageSize || 20;

  try {
    let query = supabase
      .from('properties')
      .select('*, city:cities(name, name_en)', { count: 'exact' })
      .eq('city_id', regionId);

    // Apply filters
    if (options.status) {
      query = query.eq('status', options.status);
    } else {
      query = query.eq('status', 'active'); // Default to active
    }

    if (options.propertyType) {
      query = query.eq('property_type', options.propertyType);
    }

    if (options.minPrice) {
      query = query.gte('price', options.minPrice);
    }

    if (options.maxPrice) {
      query = query.lte('price', options.maxPrice);
    }

    // Apply sorting
    const sortBy = options.sortBy || 'created_at';
    const sortOrder = options.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      errorLog('Error fetching properties by region', error instanceof Error ? error : new Error(String(error)), { regionId, options });
      return { data: [], count: 0, hasMore: false };
    }

    const hasMore = (count || 0) > (page + 1) * pageSize;

    return {
      data: data || [],
      count: count || 0,
      hasMore,
    };
  } catch (error) {
    errorLog('Error in getPropertiesByRegion', error instanceof Error ? error : new Error(String(error)), { regionId });
    return { data: [], count: 0, hasMore: false };
  }
};

/**
 * Get popular regions (for Lualaba & Haut-Katanga)
 */
export const getPopularRegions = async (): Promise<Region[]> => {
  const cacheKey = 'popular_regions';
  
  const cached = await cache.get<Region[]>(cacheKey);
  if (cached) return cached;

  try {
    // Get regions with most properties
    const { data, error } = await supabase
      .from('cities')
      .select(`
        *,
        properties(count)
      `)
      .eq('is_active', true)
      .in('province', ['Lualaba', 'Haut-Katanga'])
      .order('properties.count', { ascending: false })
      .limit(10);

    if (error) {
      errorLog('Error fetching popular regions', error instanceof Error ? error : new Error(String(error)), { errorDetails: error });
      return [];
    }

    const regions: Region[] = (data || []).map((city: any) => ({
      id: city.id,
      name: city.name,
      name_en: city.name_en || city.name,
      code: city.code || '',
      province: city.province || '',
      is_active: city.is_active ?? true,
    }));

    // Cache for 30 minutes
    await cache.set(cacheKey, regions, CACHE_TTL.MEDIUM * 6);

    return regions;
  } catch (error) {
    errorLog('Error in getPopularRegions', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
};

/**
 * Search regions with autocomplete (optimized)
 */
export const searchRegions = async (
  searchTerm: string,
  limit: number = 10
): Promise<Region[]> => {
  if (!searchTerm || searchTerm.length < 2) return [];

  const cacheKey = `region_search_${searchTerm.toLowerCase()}`;
  const cached = await cache.get<Region[]>(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%`)
      .eq('is_active', true)
      .in('province', ['Lualaba', 'Haut-Katanga'])
      .limit(limit);

    if (error) {
      errorLog('Error searching regions', error instanceof Error ? error : new Error(String(error)), { searchTerm, errorDetails: error });
      return [];
    }

    const regions: Region[] = (data || []).map((city: any) => ({
      id: city.id,
      name: city.name,
      name_en: city.name_en || city.name,
      code: city.code || '',
      province: city.province || '',
      is_active: city.is_active ?? true,
    }));

    // Cache for 5 minutes (search results change frequently)
    await cache.set(cacheKey, regions, CACHE_TTL.MEDIUM);

    return regions;
  } catch (error) {
    errorLog('Error in searchRegions', error instanceof Error ? error : new Error(String(error)), { searchTerm });
    return [];
  }
};


