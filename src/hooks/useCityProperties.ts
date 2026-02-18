// Niumba - Hook to get property counts by city
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { errorLog } from '../utils/logHelper';
import { CITIES } from '../constants/cities';
import { cache, CACHE_TTL } from '../services/cacheService';

export interface CityWithCount {
  name: string;
  nameEn: string;
  province: 'Haut-Katanga' | 'Lualaba';
  count: number;
  latitude?: number;
  longitude?: number;
}

/**
 * Hook to get property counts for all cities
 */
export const useCityProperties = () => {
  const [citiesWithCounts, setCitiesWithCounts] = useState<CityWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCityCounts = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      // Check cache first (5 minutes TTL)
      const cacheKey = 'city_property_counts';
      const cached = await cache.get<CityWithCount[]>(cacheKey);
      if (cached) {
        setCitiesWithCounts(cached);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Optimized: Use RPC function for counting (much faster than loading all properties)
        // If RPC doesn't exist, fallback to optimized query
        let cityCounts: Record<string, { count: number; province: string }> = {};
        
        try {
          // Try to use the optimized RPC function first
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('get_city_property_counts');

          if (!rpcError && rpcData) {
            // Use RPC result
            rpcData.forEach((row: any) => {
              cityCounts[row.city] = {
                count: Number(row.property_count),
                province: row.province || 'Haut-Katanga',
              };
            });
          } else {
            // Fallback: Optimized query - only select city and province (not all fields)
            const { data, error: queryError } = await supabase
              .from('properties')
              .select('city, province')
              .eq('status', 'active')
              .not('city', 'is', null);

            if (queryError) {
              throw queryError;
            }

            // Count properties by city (optimized in memory with Map)
            const cityMap = new Map<string, { count: number; province: string }>();
            
            (data || []).forEach((property: any) => {
              const city = property.city;
              if (city) {
                const existing = cityMap.get(city);
                if (existing) {
                  existing.count++;
                } else {
                  cityMap.set(city, { count: 1, province: property.province || 'Haut-Katanga' });
                }
              }
            });

            // Convert Map to object
            cityMap.forEach((value, key) => {
              cityCounts[key] = value;
            });
          }
        } catch (rpcErr) {
          // If RPC fails, use fallback query
          const { data, error: queryError } = await supabase
            .from('properties')
            .select('city, province')
            .eq('status', 'active')
            .not('city', 'is', null);

          if (queryError) {
            throw queryError;
          }

          const cityMap = new Map<string, { count: number; province: string }>();
          (data || []).forEach((property: any) => {
            const city = property.city;
            if (city) {
              const existing = cityMap.get(city);
              if (existing) {
                existing.count++;
              } else {
                cityMap.set(city, { count: 1, province: property.province || 'Haut-Katanga' });
              }
            }
          });

          cityMap.forEach((value, key) => {
            cityCounts[key] = value;
          });
        }

        // Map cities with their counts (use useMemo would be better but we're in useEffect)
        const citiesWithCounts: CityWithCount[] = CITIES.map((city) => ({
          name: city.name,
          nameEn: city.nameEn,
          province: city.province,
          count: cityCounts[city.name]?.count || 0,
          latitude: city.lat,
          longitude: city.lng,
        }));

        // Sort by count (descending) then by name - optimized
        citiesWithCounts.sort((a, b) => {
          const countDiff = b.count - a.count;
          if (countDiff !== 0) return countDiff;
          return a.name.localeCompare(b.name);
        });

        // Cache the result for 5 minutes
        await cache.set(cacheKey, citiesWithCounts, CACHE_TTL.MEDIUM);

        setCitiesWithCounts(citiesWithCounts);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        errorLog('Error fetching city property counts', errorObj);
        setError(errorObj.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCityCounts();
  }, []);

  return { citiesWithCounts, loading, error };
};

