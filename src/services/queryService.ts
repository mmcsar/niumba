// Niumba - Optimized Query Service
// Efficient data fetching with batching, deduplication, and caching

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { cache, CACHE_TTL } from './cacheService';
import { Property, Profile, Appointment } from '../types/database';

// Query configuration
const BATCH_SIZE = 50;
const BATCH_DELAY = 50; // ms

// Request deduplication
const pendingRequests: Map<string, Promise<any>> = new Map();

/**
 * Deduplicate concurrent requests with the same key
 */
async function deduplicateRequest<T>(
  key: string,
  factory: () => Promise<T>
): Promise<T> {
  // Check if same request is already pending
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  // Create new request
  const promise = factory().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

/**
 * Batch multiple requests together
 */
class BatchLoader<K, V> {
  private queue: Map<K, { resolve: (v: V) => void; reject: (e: any) => void }[]> = new Map();
  private timeout: NodeJS.Timeout | null = null;
  private batchFn: (keys: K[]) => Promise<Map<K, V>>;

  constructor(batchFn: (keys: K[]) => Promise<Map<K, V>>) {
    this.batchFn = batchFn;
  }

  async load(key: K): Promise<V> {
    return new Promise((resolve, reject) => {
      const handlers = this.queue.get(key) || [];
      handlers.push({ resolve, reject });
      this.queue.set(key, handlers);

      if (!this.timeout) {
        this.timeout = setTimeout(() => this.executeBatch(), BATCH_DELAY);
      }
    });
  }

  private async executeBatch() {
    this.timeout = null;
    const batch = new Map(this.queue);
    this.queue.clear();

    const keys = Array.from(batch.keys());
    
    try {
      const results = await this.batchFn(keys);
      
      for (const [key, handlers] of batch.entries()) {
        const value = results.get(key);
        handlers.forEach(({ resolve, reject }) => {
          if (value !== undefined) {
            resolve(value);
          } else {
            reject(new Error(`No result for key: ${key}`));
          }
        });
      }
    } catch (error) {
      for (const handlers of batch.values()) {
        handlers.forEach(({ reject }) => reject(error));
      }
    }
  }
}

// ============================================
// PROPERTY QUERIES
// ============================================

/**
 * Get properties with optimized query
 */
export async function getProperties(options: {
  page?: number;
  pageSize?: number;
  filters?: {
    type?: string;
    priceMin?: number;
    priceMax?: number;
    priceType?: 'sale' | 'rent';
    city?: string;
    province?: string;
    bedrooms?: number;
    bathrooms?: number;
    isFeatured?: boolean;
  };
  orderBy?: { column: string; ascending?: boolean };
  select?: string;
}): Promise<{ data: Property[]; count: number }> {
  const {
    page = 0,
    pageSize = 20,
    filters = {},
    orderBy = { column: 'created_at', ascending: false },
    select = `
      id, title, title_en, type, status, price, currency, price_type, rent_period,
      address, city, province, latitude, longitude, bedrooms, bathrooms, area,
      images, is_featured, is_available, views, saves, created_at,
      owner:owner_id (id, full_name, avatar_url, is_verified)
    `,
  } = options;

  // Generate cache key
  const cacheKey = `properties_${JSON.stringify({ page, pageSize, filters, orderBy })}`;

  return deduplicateRequest(cacheKey, async () => {
    // Try cache first
    const cached = await cache.get<{ data: Property[]; count: number }>(cacheKey);
    if (cached) return cached;

    if (!isSupabaseConfigured()) {
      return { data: [], count: 0 };
    }

    // Build query
    let query = supabase
      .from('properties')
      .select(select, { count: 'exact' })
      .eq('status', 'active')
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order(orderBy.column, { ascending: orderBy.ascending ?? false });

    // Apply filters
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.priceType) query = query.eq('price_type', filters.priceType);
    if (filters.city) query = query.eq('city', filters.city);
    if (filters.province) query = query.eq('province', filters.province);
    if (filters.priceMin) query = query.gte('price', filters.priceMin);
    if (filters.priceMax) query = query.lte('price', filters.priceMax);
    if (filters.bedrooms) query = query.gte('bedrooms', filters.bedrooms);
    if (filters.bathrooms) query = query.gte('bathrooms', filters.bathrooms);
    if (filters.isFeatured) query = query.eq('is_featured', true);

    const { data, error, count } = await query;

    if (error) throw error;

    const result = { data: (data || []) as Property[], count: count || 0 };

    // Cache the result
    await cache.set(cacheKey, result, CACHE_TTL.MEDIUM);

    return result;
  });
}

/**
 * Get property by ID with caching
 */
export async function getPropertyById(id: string): Promise<Property | null> {
  const cacheKey = `property_${id}`;

  return deduplicateRequest(cacheKey, async () => {
    const cached = await cache.get<Property>(cacheKey);
    if (cached) return cached;

    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        owner:owner_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (data) {
      await cache.set(cacheKey, data, CACHE_TTL.LONG);
    }

    return data as Property | null;
  });
}

// Batch loader for properties
const propertyBatchLoader = new BatchLoader<string, Property>(async (ids) => {
  if (!isSupabaseConfigured()) return new Map();

  const { data, error } = await supabase
    .from('properties')
    .select(`*, owner:owner_id (*)`)
    .in('id', ids);

  if (error) throw error;

  const map = new Map<string, Property>();
  (data || []).forEach((p: Property) => map.set(p.id, p));
  return map;
});

/**
 * Get property by ID (batched)
 */
export async function getPropertyBatched(id: string): Promise<Property | null> {
  try {
    return await propertyBatchLoader.load(id);
  } catch {
    return null;
  }
}

/**
 * Search properties with full-text search
 */
export async function searchProperties(
  query: string,
  options: {
    page?: number;
    pageSize?: number;
    filters?: Record<string, any>;
  } = {}
): Promise<{ data: Property[]; count: number }> {
  const { page = 0, pageSize = 20, filters = {} } = options;
  const cacheKey = `search_${query}_${JSON.stringify({ page, pageSize, filters })}`;

  return deduplicateRequest(cacheKey, async () => {
    const cached = await cache.get<{ data: Property[]; count: number }>(cacheKey);
    if (cached) return cached;

    if (!isSupabaseConfigured()) return { data: [], count: 0 };

    // Use PostgreSQL full-text search
    let dbQuery = supabase
      .from('properties')
      .select(`
        *,
        owner:owner_id (id, full_name, avatar_url)
      `, { count: 'exact' })
      .eq('status', 'active')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%,city.ilike.%${query}%`)
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    // Apply additional filters
    if (filters.type) dbQuery = dbQuery.eq('type', filters.type);
    if (filters.city) dbQuery = dbQuery.eq('city', filters.city);

    const { data, error, count } = await dbQuery;

    if (error) throw error;

    const result = { data: (data || []) as Property[], count: count || 0 };
    await cache.set(cacheKey, result, CACHE_TTL.SHORT);

    return result;
  });
}

/**
 * Get nearby properties using PostGIS
 */
export async function getNearbyProperties(
  latitude: number,
  longitude: number,
  radiusKm: number = 10,
  limit: number = 20
): Promise<Property[]> {
  const cacheKey = `nearby_${latitude.toFixed(3)}_${longitude.toFixed(3)}_${radiusKm}`;

  return deduplicateRequest(cacheKey, async () => {
    const cached = await cache.get<Property[]>(cacheKey);
    if (cached) return cached;

    if (!isSupabaseConfigured()) return [];

    // Use PostGIS for efficient geo queries
    const { data, error } = await supabase.rpc('get_nearby_properties', {
      lat: latitude,
      lng: longitude,
      radius_km: radiusKm,
      max_results: limit,
    } as any);

    if (error) {
      // Fallback to basic distance calculation
      const { data: fallbackData } = await supabase
        .from('properties')
        .select(`*, owner:owner_id (id, full_name, avatar_url)`)
        .eq('status', 'active')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(limit * 2); // Get more to filter

      if (fallbackData) {
        // Calculate distance client-side
        const withDistance = fallbackData.map((p: any) => ({
          ...p,
          distance: calculateDistance(latitude, longitude, p.latitude, p.longitude),
        }));

        const filtered = withDistance
          .filter((p: any) => p.distance <= radiusKm)
          .sort((a: any, b: any) => a.distance - b.distance)
          .slice(0, limit);

        await cache.set(cacheKey, filtered, CACHE_TTL.MEDIUM);
        return filtered;
      }

      return [];
    }

    await cache.set(cacheKey, data || [], CACHE_TTL.MEDIUM);
    return (data || []) as Property[];
  });
}

// Helper: Calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// ============================================
// PROFILE QUERIES
// ============================================

/**
 * Get profile by ID with caching
 */
export async function getProfileById(id: string): Promise<Profile | null> {
  const cacheKey = `profile_${id}`;

  return deduplicateRequest(cacheKey, async () => {
    const cached = await cache.get<Profile>(cacheKey);
    if (cached) return cached;

    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (data) {
      await cache.set(cacheKey, data, CACHE_TTL.LONG);
    }

    return data as Profile | null;
  });
}

// Batch loader for profiles
const profileBatchLoader = new BatchLoader<string, Profile>(async (ids) => {
  if (!isSupabaseConfigured()) return new Map();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', ids);

  if (error) throw error;

  const map = new Map<string, Profile>();
  (data || []).forEach((p: Profile) => map.set(p.id, p));
  return map;
});

/**
 * Get profile by ID (batched)
 */
export async function getProfileBatched(id: string): Promise<Profile | null> {
  try {
    return await profileBatchLoader.load(id);
  } catch {
    return null;
  }
}

// ============================================
// APPOINTMENT QUERIES
// ============================================

/**
 * Get appointments for a user
 */
export async function getUserAppointments(
  userId: string,
  options: {
    status?: string;
    upcoming?: boolean;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<Appointment[]> {
  const { status, upcoming = true, page = 0, pageSize = 20 } = options;
  const cacheKey = `appointments_user_${userId}_${JSON.stringify(options)}`;

  return deduplicateRequest(cacheKey, async () => {
    const cached = await cache.get<Appointment[]>(cacheKey);
    if (cached) return cached;

    if (!isSupabaseConfigured()) return [];

    let query = supabase
      .from('appointments')
      .select(`
        *,
        property:property_id (id, title, title_en, images, address),
        agent:agent_id (id, full_name, avatar_url)
      `)
      .or(`client_id.eq.${userId},agent_id.eq.${userId}`)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (upcoming) {
      query = query.gte('appointment_date', new Date().toISOString().split('T')[0]);
    }

    query = query.order('appointment_date', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    await cache.set(cacheKey, data || [], CACHE_TTL.SHORT);
    return (data || []) as Appointment[];
  });
}

/**
 * Get available time slots for a property
 */
export async function getAvailableSlots(
  propertyId: string,
  date: string
): Promise<string[]> {
  const cacheKey = `slots_${propertyId}_${date}`;

  return deduplicateRequest(cacheKey, async () => {
    const cached = await cache.get<string[]>(cacheKey);
    if (cached) return cached;

    if (!isSupabaseConfigured()) {
      // Return default slots
      return ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
    }

    const { data, error } = await supabase.rpc('get_available_slots', {
      p_property_id: propertyId,
      p_date: date,
    } as any);

    if (error) {
      // Fallback: generate default slots and filter booked ones
      const defaultSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
      
      const { data: booked } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('property_id', propertyId)
        .eq('appointment_date', date)
        .not('status', 'in', '("cancelled","no_show")');

      const bookedTimes = new Set((booked || []).map((a: any) => a.appointment_time?.slice(0, 5)));
      const available = defaultSlots.filter((slot) => !bookedTimes.has(slot));

      await cache.set(cacheKey, available, CACHE_TTL.SHORT);
      return available;
    }

    const slots = Array.isArray(data) ? (data as any[]).map((s: any) => s.slot_time?.slice(0, 5)) : [];
    await cache.set(cacheKey, slots, CACHE_TTL.SHORT);
    return slots;
  });
}

// ============================================
// CACHE INVALIDATION
// ============================================

/**
 * Invalidate property cache
 */
export async function invalidatePropertyCache(propertyId?: string) {
  if (propertyId) {
    await cache.delete(`property_${propertyId}`);
  }
  await cache.deletePattern('properties_');
  await cache.deletePattern('search_');
  await cache.deletePattern('nearby_');
}

/**
 * Invalidate profile cache
 */
export async function invalidateProfileCache(profileId: string) {
  await cache.delete(`profile_${profileId}`);
}

/**
 * Invalidate appointment cache
 */
export async function invalidateAppointmentCache(userId?: string) {
  if (userId) {
    await cache.deletePattern(`appointments_user_${userId}`);
  }
  await cache.deletePattern('slots_');
}

export default {
  getProperties,
  getPropertyById,
  getPropertyBatched,
  searchProperties,
  getNearbyProperties,
  getProfileById,
  getProfileBatched,
  getUserAppointments,
  getAvailableSlots,
  invalidatePropertyCache,
  invalidateProfileCache,
  invalidateAppointmentCache,
};

