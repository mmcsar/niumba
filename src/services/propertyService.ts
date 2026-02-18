// Niumba - Property Service
// Handles all property-related operations with Supabase

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Property, PropertyStatus } from '../types/database';
import { mapSupabasePropertyToProperty, mapSupabasePropertiesToProperties } from '../utils/propertyMapper';
import { Property as ComponentProperty } from '../types';
import { errorLog, warnLog, devLog } from '../utils/logHelper';

export interface PropertyFilters {
  city?: string;
  province?: string;
  type?: string;
  priceType?: 'sale' | 'rent';
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  status?: string;
  search?: string;
  ownerId?: string;
}

export interface PropertyListOptions {
  page?: number;
  pageSize?: number;
  filters?: PropertyFilters;
  sortBy?: 'price' | 'created_at' | 'views';
  sortOrder?: 'asc' | 'desc';
}

// Optimized field selection for list views (cards)
// Only select fields needed for property cards to reduce data transfer
// Note: agent_id and reference_number removed if columns don't exist in database
const PROPERTY_LIST_FIELDS = 'id, title, title_en, price, price_type, city, province, type, bedrooms, bathrooms, area, images, status, created_at, owner_id, is_featured, views, latitude, longitude';

/**
 * Get properties with filters and pagination
 */
export const getProperties = async (
  options: PropertyListOptions = {}
): Promise<{ data: ComponentProperty[]; count: number }> => {
  if (!isSupabaseConfigured()) {
    return { data: [], count: 0 };
  }

  const {
    page = 0,
    pageSize = 20,
    filters = {},
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = options;

  try {
    devLog('[getProperties] Fetching properties with filters', { filters, page, pageSize });
    let query = supabase
      .from('properties')
      .select(PROPERTY_LIST_FIELDS, { count: 'exact' })
      .eq('status', filters.status || 'active');

    // Apply filters
    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.province) {
      query = query.eq('province', filters.province);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.priceType) {
      query = query.eq('price_type', filters.priceType);
    }

    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters.bedrooms !== undefined) {
      query = query.eq('bedrooms', filters.bedrooms);
    }

    if (filters.ownerId) {
      query = query.eq('owner_id', filters.ownerId);
    }

    // Search in title and description
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,title_en.ilike.%${filters.search}%,description_en.ilike.%${filters.search}%`);
    }

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      errorLog('Error fetching properties', error instanceof Error ? error : new Error(String(error)), { 
        errorCode: error.code,
        errorMessage: error.message,
        filters: options.filters,
        fields: PROPERTY_LIST_FIELDS
      });
      return { data: [], count: 0 };
    }

    // Map Supabase properties to component format
    const mappedProperties = mapSupabasePropertiesToProperties((data || []) as Property[]);

    return {
      data: mappedProperties,
      count: count || 0,
    };
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    errorLog('Error fetching properties (exception)', errorObj, { 
      errorMessage: errorObj.message,
      errorStack: errorObj.stack,
      filters: options.filters,
      fields: PROPERTY_LIST_FIELDS
    });
    return { data: [], count: 0 };
  }
};

/**
 * Get a single property by ID
 */
export const getPropertyById = async (propertyId: string): Promise<ComponentProperty | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    // Essayer d'utiliser la vue sécurisée pour le propriétaire
    let query = supabase
      .from('properties')
      .select(`
        *,
        owner:profiles_public_secure!properties_owner_id_fkey(id, full_name, email, phone, avatar_url, company_name, is_verified, role)
      `)
      .eq('id', propertyId)
      .single();

    let { data, error } = await query;

    // Si la vue n'existe pas, utiliser la table normale
    if (error && error.code === '42P01') {
      query = supabase
        .from('properties')
        .select(`
          *,
          owner:profiles!properties_owner_id_fkey(id, full_name, email, phone, avatar_url, company_name, is_verified, role)
        `)
        .eq('id', propertyId)
        .single();
      
      const result = await query;
      data = result.data;
      error = result.error;
    }

    if (error) {
      errorLog('Error fetching property', error instanceof Error ? error : new Error(String(error)), { propertyId });
      return null;
    }

    if (!data) return null;

    // Map Supabase property to component format
    const ownerData = (data as any).owner;
    const owner = ownerData ? {
      id: ownerData.id,
      name: ownerData.full_name || 'Unknown',
      company: ownerData.company_name || undefined,
      phone: ownerData.phone || '',
      email: ownerData.email || '',
      avatar: ownerData.avatar_url || undefined,
      isVerified: ownerData.is_verified || false,
      propertiesCount: 0,
    } : undefined;

    return mapSupabasePropertyToProperty(data as Property, owner);
  } catch (error) {
    errorLog('Error fetching property (exception)', error instanceof Error ? error : new Error(String(error)), { propertyId });
    return null;
  }
};

/**
 * Get featured properties
 */
export const getFeaturedProperties = async (limit: number = 6): Promise<ComponentProperty[]> => {
  if (!isSupabaseConfigured()) {
    warnLog('[getFeaturedProperties] Supabase not configured');
    return [];
  }

  try {
    devLog('[getFeaturedProperties] Fetching featured properties...');
    const { data, error, count } = await supabase
      .from('properties')
      .select(PROPERTY_LIST_FIELDS, { count: 'exact' })
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      errorLog('[getFeaturedProperties] Error fetching featured properties', error instanceof Error ? error : new Error(String(error)), { 
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error,
        fields: PROPERTY_LIST_FIELDS
      });
      // Fallback: try to get any active properties if no featured ones
      devLog('[getFeaturedProperties] Trying fallback: getting any active properties...');
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('properties')
          .select(PROPERTY_LIST_FIELDS)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (fallbackError) {
          errorLog('[getFeaturedProperties] Fallback error', fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError)), { errorDetails: fallbackError });
          return [];
        }
        
        devLog(`[getFeaturedProperties] Fallback: Found ${fallbackData?.length || 0} properties`);
        return mapSupabasePropertiesToProperties((fallbackData || []) as Property[]);
      } catch (fallbackException) {
        errorLog('[getFeaturedProperties] Fallback exception', fallbackException instanceof Error ? fallbackException : new Error(String(fallbackException)));
        return [];
      }
    }

    devLog(`[getFeaturedProperties] Found ${data?.length || 0} featured properties (total: ${count || 0})`);
    
    // If no featured properties, try to get any active properties
    if (!data || data.length === 0) {
      devLog('[getFeaturedProperties] No featured properties, trying fallback...');
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('properties')
          .select(PROPERTY_LIST_FIELDS)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (fallbackError) {
          errorLog('[getFeaturedProperties] Fallback error', fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError)), { errorDetails: fallbackError });
          return [];
        }
        
        devLog(`[getFeaturedProperties] Fallback: Found ${fallbackData?.length || 0} properties`);
        return mapSupabasePropertiesToProperties((fallbackData || []) as Property[]);
      } catch (fallbackException) {
        errorLog('[getFeaturedProperties] Fallback exception', fallbackException instanceof Error ? fallbackException : new Error(String(fallbackException)));
        return [];
      }
    }

    // Map Supabase properties to component format
    const mapped = mapSupabasePropertiesToProperties((data || []) as Property[]);
    devLog(`[getFeaturedProperties] Mapped ${mapped.length} properties`);
    return mapped;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    errorLog('[getFeaturedProperties] Exception', errorObj, { 
      errorMessage: errorObj.message,
      errorStack: errorObj.stack,
      fields: PROPERTY_LIST_FIELDS
    });
    return [];
  }
};

/**
 * Get properties by city
 */
export const getPropertiesByCity = async (
  city: string,
  limit: number = 20
): Promise<ComponentProperty[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('properties')
      .select(PROPERTY_LIST_FIELDS)
      .eq('status', 'active')
      .eq('city', city)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      errorLog('Error fetching properties by city', error instanceof Error ? error : new Error(String(error)), { city });
      return [];
    }

    // Map Supabase properties to component format
    return mapSupabasePropertiesToProperties((data || []) as Property[]);
  } catch (error) {
    errorLog('Error fetching properties by city (exception)', error instanceof Error ? error : new Error(String(error)), { city });
    return [];
  }
};

/**
 * Get properties by type
 */
export const getPropertiesByType = async (
  type: string,
  limit: number = 20
): Promise<ComponentProperty[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('properties')
      .select(PROPERTY_LIST_FIELDS)
      .eq('status', 'active')
      .eq('type', type)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      errorLog('Error fetching properties by type', error instanceof Error ? error : new Error(String(error)), { type });
      return [];
    }

    // Map Supabase properties to component format
    return mapSupabasePropertiesToProperties((data || []) as Property[]);
  } catch (error) {
    errorLog('Error fetching properties by type (exception)', error instanceof Error ? error : new Error(String(error)), { type });
    return [];
  }
};

/**
 * Search properties
 */
export const searchProperties = async (
  query: string,
  options: PropertyListOptions = {}
): Promise<{ data: ComponentProperty[]; count: number }> => {
  return getProperties({
    ...options,
    filters: {
      ...options.filters,
      search: query,
    },
  });
};

/**
 * Get nearby properties (by coordinates)
 */
export const getNearbyProperties = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10,
  limit: number = 20
): Promise<ComponentProperty[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    // Simple distance calculation (can be improved with PostGIS)
    const { data, error } = await supabase
      .from('properties')
      .select(PROPERTY_LIST_FIELDS)
      .eq('status', 'active')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .limit(limit * 2); // Get more to filter by distance

    if (error) {
      errorLog('Error fetching nearby properties', error instanceof Error ? error : new Error(String(error)), { latitude, longitude, radiusKm });
      return [];
    }

    // Calculate distance and filter
    const propertiesWithDistance = (data || [])
      .map((property: any) => {
        if (!property.latitude || !property.longitude) return null;

        // Haversine formula for distance calculation
        const R = 6371; // Earth radius in km
        const dLat = (property.latitude - latitude) * Math.PI / 180;
        const dLon = (property.longitude - longitude) * Math.PI / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(latitude * Math.PI / 180) *
          Math.cos(property.latitude * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return {
          ...property,
          distance,
        };
      })
      .filter((p: any) => p !== null && p.distance <= radiusKm)
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, limit);

    // Map Supabase properties to component format
    return mapSupabasePropertiesToProperties(
      propertiesWithDistance.map((p: any) => {
        const { distance, ...property } = p;
        return property;
      }) as Property[]
    );
  } catch (error) {
    errorLog('Error fetching nearby properties (exception)', error instanceof Error ? error : new Error(String(error)), { latitude, longitude, radiusKm });
    return [];
  }
};

/**
 * Increment property views
 */
export const incrementPropertyViews = async (propertyId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    // Get current views
    const { data: property } = await supabase
      .from('properties')
      .select('views')
      .eq('id', propertyId)
      .single();

    if (!property) return false;

    const currentViews = (property as any).views || 0;

    // Increment views
    // @ts-ignore - TypeScript issue with Supabase update types
    const { error } = await (supabase
      .from('properties') as any)
      .update({ views: currentViews + 1 } as any)
      .eq('id', propertyId);

    if (error) {
      errorLog('Error incrementing views', error instanceof Error ? error : new Error(String(error)), { propertyId });
      return false;
    }

    // Also log the view (if table exists)
    try {
      await supabase
        .from('property_views')
        .insert({
          property_id: propertyId,
          viewed_at: new Date().toISOString(),
        } as any);
    } catch (viewLogError) {
      // Ignore if table doesn't exist
      devLog('[incrementPropertyViews] Could not log view (table may not exist)');
    }

    return true;
  } catch (error) {
    errorLog('Error incrementing views', error instanceof Error ? error : new Error(String(error)), { propertyId });
    return false;
  }
};

/**
 * Bulk update properties status
 */
export const bulkUpdateStatus = async (
  propertyIds: string[],
  status: PropertyStatus
): Promise<{ success: number; failed: number }> => {
  if (!isSupabaseConfigured() || propertyIds.length === 0) {
    return { success: 0, failed: propertyIds.length };
  }

  try {
    const { error, count } = await (supabase
      .from('properties') as any)
      .update({ 
        status,
        published_at: status === 'active' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      } as any)
      .in('id', propertyIds);

    if (error) throw error;

    return { success: count || propertyIds.length, failed: 0 };
  } catch (error) {
    errorLog('Error bulk updating properties status', error instanceof Error ? error : new Error(String(error)), { propertyIds, status });
    return { success: 0, failed: propertyIds.length };
  }
};

/**
 * Bulk delete properties
 */
export const bulkDeleteProperties = async (
  propertyIds: string[]
): Promise<{ success: number; failed: number }> => {
  if (!isSupabaseConfigured() || propertyIds.length === 0) {
    return { success: 0, failed: propertyIds.length };
  }

  try {
    const { error, count } = await supabase
      .from('properties')
      .delete()
      .in('id', propertyIds);

    if (error) throw error;

    return { success: count || propertyIds.length, failed: 0 };
  } catch (error) {
    errorLog('Error bulk deleting properties', error instanceof Error ? error : new Error(String(error)), { propertyIds });
    return { success: 0, failed: propertyIds.length };
  }
};

/**
 * Bulk publish properties
 */
export const bulkPublishProperties = async (
  propertyIds: string[]
): Promise<{ success: number; failed: number }> => {
  return bulkUpdateStatus(propertyIds, 'active');
};

/**
 * Bulk unpublish properties
 */
export const bulkUnpublishProperties = async (
  propertyIds: string[]
): Promise<{ success: number; failed: number }> => {
  return bulkUpdateStatus(propertyIds, 'inactive');
};

export default {
  getProperties,
  getPropertyById,
  getFeaturedProperties,
  getPropertiesByCity,
  getPropertiesByType,
  searchProperties,
  getNearbyProperties,
  incrementPropertyViews,
  bulkUpdateStatus,
  bulkDeleteProperties,
  bulkPublishProperties,
  bulkUnpublishProperties,
};

