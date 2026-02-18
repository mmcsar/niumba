// Niumba - Property Mapper
// Converts Supabase Property (snake_case) to Component Property (camelCase)

import { Property as SupabaseProperty } from '../types/database';
import { Property, Owner } from '../types';

/**
 * Map Supabase Property to Component Property format
 */
export const mapSupabasePropertyToProperty = (
  supabaseProperty: SupabaseProperty,
  owner?: Owner
): Property => {
  // Default owner if not provided
  const defaultOwner: Owner = owner || {
    id: supabaseProperty.owner_id,
    name: 'Unknown Owner',
    phone: '',
    email: '',
    isVerified: false,
    propertiesCount: 0,
  };

  return {
    id: supabaseProperty.id,
    title: supabaseProperty.title,
    titleEn: supabaseProperty.title_en || supabaseProperty.title,
    type: supabaseProperty.type,
    price: Number(supabaseProperty.price) || 0,
    currency: supabaseProperty.currency || 'USD',
    priceType: supabaseProperty.price_type,
    rentPeriod: supabaseProperty.rent_period as 'month' | 'year' | undefined,
    address: supabaseProperty.address,
    city: supabaseProperty.city,
    province: supabaseProperty.province as 'Haut-Katanga' | 'Lualaba',
    latitude: supabaseProperty.latitude || 0,
    longitude: supabaseProperty.longitude || 0,
    bedrooms: supabaseProperty.bedrooms || 0,
    bathrooms: supabaseProperty.bathrooms || 0,
    area: supabaseProperty.area || 0,
    garage: supabaseProperty.garage || 0,
    description: supabaseProperty.description,
    descriptionEn: supabaseProperty.description_en || supabaseProperty.description,
    images: supabaseProperty.images || [],
    features: supabaseProperty.features || [],
    featuresEn: supabaseProperty.features_en || [],
    owner: defaultOwner,
    createdAt: supabaseProperty.created_at,
    updatedAt: supabaseProperty.updated_at,
    isFeatured: supabaseProperty.is_featured || false,
    isAvailable: supabaseProperty.is_available !== false,
    views: supabaseProperty.views || 0,
    virtualTourUrl: supabaseProperty.virtual_tour_url || undefined,
  };
};

/**
 * Map array of Supabase Properties to Component Properties
 */
export const mapSupabasePropertiesToProperties = (
  supabaseProperties: SupabaseProperty[],
  ownersMap?: Map<string, Owner>
): Property[] => {
  return supabaseProperties.map((prop) => {
    const owner = ownersMap?.get(prop.owner_id);
    return mapSupabasePropertyToProperty(prop, owner);
  });
};

/**
 * Get owner from Supabase profile
 */
export const mapProfileToOwner = (profile: any): Owner => {
  return {
    id: profile.id,
    name: profile.full_name || 'Unknown',
    company: profile.company_name || undefined,
    phone: profile.phone || '',
    email: profile.email || '',
    avatar: profile.avatar_url || undefined,
    isVerified: profile.is_verified || false,
    propertiesCount: 0, // This would need to be fetched separately
  };
};

export default {
  mapSupabasePropertyToProperty,
  mapSupabasePropertiesToProperties,
  mapProfileToOwner,
};


