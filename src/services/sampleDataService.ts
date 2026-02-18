// Niumba - Sample Data Service
// Service pour créer des données d'exemple depuis le dashboard admin

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface SampleProperty {
  title: string;
  titleEn: string;
  type: string;
  price: number;
  currency: string;
  priceType: 'sale' | 'rent';
  rentPeriod?: 'month' | 'year';
  address: string;
  city: string;
  province: 'Haut-Katanga' | 'Lualaba';
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  garage: number;
  description: string;
  descriptionEn: string;
  images: string[];
  features: string[];
  featuresEn: string[];
  isFeatured: boolean;
}

const SAMPLE_PROPERTIES: SampleProperty[] = [
  {
    title: 'Villa Moderne Golf',
    titleEn: 'Modern Golf Villa',
    type: 'house',
    price: 350000,
    currency: 'USD',
    priceType: 'sale',
    address: 'Avenue du Golf, Quartier Golf',
    city: 'Lubumbashi',
    province: 'Haut-Katanga',
    latitude: -11.6876,
    longitude: 27.4847,
    bedrooms: 5,
    bathrooms: 4,
    area: 450,
    garage: 2,
    description: 'Magnifique villa moderne située dans le prestigieux quartier Golf de Lubumbashi. Cette propriété exceptionnelle offre un cadre de vie luxueux avec des finitions haut de gamme.',
    descriptionEn: 'Beautiful modern villa located in the prestigious Golf neighborhood of Lubumbashi. This exceptional property offers a luxurious living environment with high-end finishes.',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
    ],
    features: ['Piscine', 'Jardin', 'Sécurité 24h', 'Groupe électrogène', 'Forage'],
    featuresEn: ['Swimming Pool', 'Garden', '24h Security', 'Generator', 'Borehole'],
    isFeatured: true,
  },
  {
    title: 'Appartement Centre-Ville',
    titleEn: 'Downtown Apartment',
    type: 'apartment',
    price: 1500,
    currency: 'USD',
    priceType: 'rent',
    rentPeriod: 'month',
    address: 'Avenue Kasavubu, Centre-Ville',
    city: 'Lubumbashi',
    province: 'Haut-Katanga',
    latitude: -11.6642,
    longitude: 27.4794,
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    garage: 1,
    description: 'Superbe appartement au cœur de Lubumbashi, idéal pour les professionnels. Proximité des commerces et bureaux.',
    descriptionEn: 'Superb apartment in the heart of Lubumbashi, ideal for professionals. Close to shops and offices.',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    ],
    features: ['Climatisation', 'Ascenseur', 'Parking', 'Internet fibre'],
    featuresEn: ['Air Conditioning', 'Elevator', 'Parking', 'Fiber Internet'],
    isFeatured: true,
  },
  {
    title: 'Maison Familiale Kolwezi',
    titleEn: 'Family House Kolwezi',
    type: 'house',
    price: 180000,
    currency: 'USD',
    priceType: 'sale',
    address: 'Quartier Mutoshi',
    city: 'Kolwezi',
    province: 'Lualaba',
    latitude: -10.7167,
    longitude: 25.4667,
    bedrooms: 4,
    bathrooms: 3,
    area: 280,
    garage: 1,
    description: 'Belle maison familiale dans un quartier calme de Kolwezi. Parfait pour une famille avec enfants.',
    descriptionEn: 'Beautiful family house in a quiet neighborhood of Kolwezi. Perfect for a family with children.',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ],
    features: ['Jardin', 'Citerne', 'Panneau solaire', 'Clôture sécurisée'],
    featuresEn: ['Garden', 'Water Tank', 'Solar Panel', 'Secured Fence'],
    isFeatured: false,
  },
  {
    title: 'Terrain Commercial Likasi',
    titleEn: 'Commercial Land Likasi',
    type: 'land',
    price: 75000,
    currency: 'USD',
    priceType: 'sale',
    address: 'Avenue Principale, Centre Likasi',
    city: 'Likasi',
    province: 'Haut-Katanga',
    latitude: -10.9833,
    longitude: 26.7333,
    bedrooms: 0,
    bathrooms: 0,
    area: 2000,
    garage: 0,
    description: 'Terrain commercial stratégiquement situé au centre de Likasi. Idéal pour construction de centre commercial ou immeuble de bureaux.',
    descriptionEn: 'Strategically located commercial land in the center of Likasi. Ideal for shopping center or office building construction.',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
    ],
    features: ['Titre foncier', 'Zone commerciale', 'Accès route principale'],
    featuresEn: ['Land Title', 'Commercial Zone', 'Main Road Access'],
    isFeatured: true,
  },
  {
    title: 'Duplex Moderne Lubumbashi',
    titleEn: 'Modern Duplex Lubumbashi',
    type: 'townhouse',
    price: 2800,
    currency: 'USD',
    priceType: 'rent',
    rentPeriod: 'month',
    address: 'Quartier Bel-Air',
    city: 'Lubumbashi',
    province: 'Haut-Katanga',
    latitude: -11.6500,
    longitude: 27.4800,
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    garage: 2,
    description: 'Magnifique duplex dans le quartier résidentiel Bel-Air. Construction récente avec matériaux de qualité.',
    descriptionEn: 'Magnificent duplex in the residential Bel-Air neighborhood. Recent construction with quality materials.',
    images: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
      'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800',
    ],
    features: ['Terrasse', 'Cuisine équipée', 'Dressing', 'Groupe électrogène'],
    featuresEn: ['Terrasse', 'Equipped Kitchen', 'Walk-in Closet', 'Generator'],
    isFeatured: true,
  },
];

/**
 * Créer les propriétés d'exemple dans Supabase
 */
export const createSampleProperties = async (ownerId: string): Promise<{ success: number; errors: number; details: string[] }> => {
  if (!isSupabaseConfigured()) {
    return {
      success: 0,
      errors: SAMPLE_PROPERTIES.length,
      details: ['Supabase n\'est pas configuré'],
    };
  }

  let successCount = 0;
  let errorCount = 0;
  const details: string[] = [];

  for (const property of SAMPLE_PROPERTIES) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          owner_id: ownerId,
          title: property.title,
          title_en: property.titleEn,
          type: property.type,
          price: property.price,
          currency: property.currency,
          price_type: property.priceType,
          rent_period: property.rentPeriod || null,
          address: property.address,
          city: property.city,
          province: property.province,
          latitude: property.latitude,
          longitude: property.longitude,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          area: property.area,
          garage: property.garage,
          description: property.description,
          description_en: property.descriptionEn,
          images: property.images,
          features: property.features,
          features_en: property.featuresEn,
          status: 'active',
          is_featured: property.isFeatured,
          is_available: true,
        } as any)
        .select('id')
        .single();

      if (error) {
        errorCount++;
        details.push(`❌ ${property.title}: ${error.message}`);
        console.error(`Error creating property ${property.title}:`, error);
      } else {
        successCount++;
        details.push(`✅ ${property.title} créée avec succès`);
      }
    } catch (err) {
      errorCount++;
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      details.push(`❌ ${property.title}: ${errorMessage}`);
      console.error(`Exception creating property ${property.title}:`, err);
    }
  }

  return {
    success: successCount,
    errors: errorCount,
    details,
  };
};

/**
 * Vérifier si des propriétés d'exemple existent déjà
 */
export const checkSamplePropertiesExist = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    // Vérifier si au moins une des propriétés d'exemple existe
    const { data, error } = await supabase
      .from('properties')
      .select('id, title')
      .in('title', SAMPLE_PROPERTIES.map(p => p.title))
      .limit(1);

    if (error) {
      // Silently return false if error (table might not exist)
      return false;
    }

    return (data?.length || 0) > 0;
  } catch (err) {
    // Silently return false if exception
    return false;
  }
};

/**
 * Obtenir le nombre de propriétés d'exemple
 */
export const getSamplePropertiesCount = (): number => {
  return SAMPLE_PROPERTIES.length;
};

export default {
  createSampleProperties,
  checkSamplePropertiesExist,
  getSamplePropertiesCount,
  SAMPLE_PROPERTIES,
};


