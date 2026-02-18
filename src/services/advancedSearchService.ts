// Niumba - Advanced Search Service
// Service complet pour la recherche avancée avec filtres combinés, historique et suggestions
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropertyFilters } from './propertyService';
import { Property } from '../types';

export interface AdvancedSearchFilters extends PropertyFilters {
  bathrooms?: number;
  areaMin?: number;
  areaMax?: number;
  cities?: string[];
  features?: string[];
  sortBy?: 'price' | 'created_at' | 'views' | 'area' | 'bedrooms';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  filters: AdvancedSearchFilters;
  resultsCount: number;
  timestamp: number;
}

export interface SearchSuggestion {
  type: 'query' | 'city' | 'type' | 'price_range';
  value: string;
  label: string;
  count?: number;
}

const SEARCH_HISTORY_KEY = '@niumba_search_history';
const MAX_HISTORY_ITEMS = 20;
const MAX_SUGGESTIONS = 10;

/**
 * Sauvegarder une recherche dans l'historique
 */
export const saveSearchToHistory = async (
  query: string,
  filters: AdvancedSearchFilters,
  resultsCount: number
): Promise<void> => {
  try {
    const history = await getSearchHistory();
    const newItem: SearchHistoryItem = {
      id: `search_${Date.now()}_${Math.random()}`,
      query,
      filters,
      resultsCount,
      timestamp: Date.now(),
    };

    // Ajouter au début et limiter à MAX_HISTORY_ITEMS
    const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error saving search to history:', error);
  }
};

/**
 * Récupérer l'historique des recherches
 */
export const getSearchHistory = async (): Promise<SearchHistoryItem[]> => {
  try {
    const historyJson = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
    if (!historyJson) return [];
    
    const history = JSON.parse(historyJson) as SearchHistoryItem[];
    // Trier par timestamp (plus récent en premier)
    return history.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
};

/**
 * Supprimer un élément de l'historique
 */
export const removeSearchFromHistory = async (id: string): Promise<void> => {
  try {
    const history = await getSearchHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error removing search from history:', error);
  }
};

/**
 * Vider l'historique
 */
export const clearSearchHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
};

/**
 * Générer des suggestions intelligentes basées sur l'historique et les propriétés populaires
 */
export const getSearchSuggestions = async (
  query: string,
  properties: Property[] = []
): Promise<SearchSuggestion[]> => {
  const suggestions: SearchSuggestion[] = [];

  try {
    // 1. Suggestions basées sur l'historique
    const history = await getSearchHistory();
    const historyQueries = history
      .filter(item => 
        item.query.toLowerCase().includes(query.toLowerCase()) ||
        item.filters.search?.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 3)
      .map(item => ({
        type: 'query' as const,
        value: item.query || item.filters.search || '',
        label: item.query || item.filters.search || '',
        count: item.resultsCount,
      }));

    suggestions.push(...historyQueries);

    // 2. Suggestions basées sur les villes (si query ressemble à une ville)
    const cities = extractCitiesFromProperties(properties);
    const citySuggestions = cities
      .filter(city => city.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map(city => ({
        type: 'city' as const,
        value: city,
        label: city,
      }));

    suggestions.push(...citySuggestions);

    // 3. Suggestions basées sur les types de propriétés
    if (query.length > 0) {
      const propertyTypes = ['house', 'apartment', 'land', 'commercial'];
      const typeSuggestions = propertyTypes
        .filter(type => type.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 2)
        .map(type => ({
          type: 'type' as const,
          value: type,
          label: type.charAt(0).toUpperCase() + type.slice(1),
        }));

      suggestions.push(...typeSuggestions);
    }

    // Limiter et retourner
    return suggestions.slice(0, MAX_SUGGESTIONS);
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return suggestions;
  }
};

/**
 * Extraire les villes uniques des propriétés
 */
const extractCitiesFromProperties = (properties: Property[]): string[] => {
  const cities = new Set<string>();
  properties.forEach(property => {
    if (property.city) {
      cities.add(property.city);
    }
  });
  return Array.from(cities).sort();
};

/**
 * Appliquer les filtres avancés à une liste de propriétés
 */
export const applyAdvancedFilters = (
  properties: Property[],
  filters: AdvancedSearchFilters
): Property[] => {
  let filtered = [...properties];

  // Filtre par type de prix
  if (filters.priceType) {
    filtered = filtered.filter(p => p.priceType === filters.priceType);
  }

  // Filtre par prix min/max
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= filters.maxPrice!);
  }

  // Filtre par chambres
  if (filters.bedrooms !== undefined) {
    filtered = filtered.filter(p => p.bedrooms >= filters.bedrooms!);
  }

  // Filtre par salles de bain
  if (filters.bathrooms !== undefined) {
    filtered = filtered.filter(p => p.bathrooms >= filters.bathrooms!);
  }

  // Filtre par superficie
  if (filters.areaMin !== undefined) {
    filtered = filtered.filter(p => p.area >= filters.areaMin!);
  }
  if (filters.areaMax !== undefined) {
    filtered = filtered.filter(p => p.area <= filters.areaMax!);
  }

  // Filtre par type
  if (filters.type) {
    filtered = filtered.filter(p => p.type === filters.type);
  }

  // Filtre par ville
  if (filters.city) {
    filtered = filtered.filter(p => p.city === filters.city);
  }
  if (filters.cities && filters.cities.length > 0) {
    filtered = filtered.filter(p => filters.cities!.includes(p.city));
  }

  // Filtre par province
  if (filters.province) {
    filtered = filtered.filter(p => p.province === filters.province);
  }

  // Recherche textuelle
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(searchLower) ||
      p.titleEn?.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower) ||
      p.descriptionEn?.toLowerCase().includes(searchLower) ||
      p.address?.toLowerCase().includes(searchLower) ||
      p.city.toLowerCase().includes(searchLower)
    );
  }

  // Tri
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'created_at':
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        case 'views':
          aValue = a.views || 0;
          bValue = b.views || 0;
          break;
        case 'area':
          aValue = a.area || 0;
          bValue = b.area || 0;
          break;
        case 'bedrooms':
          aValue = a.bedrooms || 0;
          bValue = b.bedrooms || 0;
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }

  return filtered;
};

/**
 * Compter les résultats pour un ensemble de filtres
 */
export const countFilteredResults = (
  properties: Property[],
  filters: AdvancedSearchFilters
): number => {
  return applyAdvancedFilters(properties, filters).length;
};

/**
 * Obtenir les filtres actifs (pour affichage)
 */
export const getActiveFilters = (filters: AdvancedSearchFilters): string[] => {
  const active: string[] = [];

  if (filters.priceType) {
    active.push(filters.priceType === 'sale' ? 'For Sale' : 'For Rent');
  }

  if (filters.minPrice || filters.maxPrice) {
    const min = filters.minPrice ? `$${filters.minPrice.toLocaleString()}` : '';
    const max = filters.maxPrice ? `$${filters.maxPrice.toLocaleString()}` : '';
    active.push(`Price: ${min}${min && max ? ' - ' : ''}${max}`);
  }

  if (filters.bedrooms) {
    active.push(`${filters.bedrooms}+ Bedrooms`);
  }

  if (filters.bathrooms) {
    active.push(`${filters.bathrooms}+ Bathrooms`);
  }

  if (filters.type) {
    active.push(`Type: ${filters.type}`);
  }

  if (filters.city) {
    active.push(`City: ${filters.city}`);
  }

  if (filters.cities && filters.cities.length > 0) {
    active.push(`Cities: ${filters.cities.length}`);
  }

  if (filters.features && filters.features.length > 0) {
    active.push(`Features: ${filters.features.length}`);
  }

  return active;
};

export default {
  saveSearchToHistory,
  getSearchHistory,
  removeSearchFromHistory,
  clearSearchHistory,
  getSearchSuggestions,
  applyAdvancedFilters,
  countFilteredResults,
  getActiveFilters,
};


