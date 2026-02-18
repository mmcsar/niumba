// Niumba - Saved Search Service
// Handles saving and loading user search preferences

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { errorLog, devLog } from '../utils/logHelper';

export interface SavedSearch {
  id: string;
  name: string;
  filters: {
    query: string;
    priceType: 'all' | 'sale' | 'rent';
    priceMin: number;
    priceMax: number;
    propertyTypes: string[];
    bedroomsMin: number;
    bathroomsMin: number;
    areaMin: number;
    areaMax: number;
    cities: string[];
    features: string[];
  };
  createdAt: string;
  lastUsed?: string;
}

const STORAGE_KEY = '@niumba_saved_searches';
const MAX_SAVED_SEARCHES = 10; // Maximum number of saved searches

/**
 * Get all saved searches
 */
export const getSavedSearches = async (): Promise<SavedSearch[]> => {
  try {
    if (isSupabaseConfigured()) {
      // Try to get from Supabase first
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('saved_searches')
          .select('*')
          .eq('user_id', user.id)
          .order('last_used', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(MAX_SAVED_SEARCHES);

        if (!error && data) {
          return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            filters: item.filters,
            createdAt: item.created_at,
            lastUsed: item.last_used,
          }));
        }
      }
    }

    // Fallback to AsyncStorage
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (error) {
    errorLog('Error getting saved searches', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
};

/**
 * Save a search
 */
export const saveSearch = async (
  name: string,
  filters: SavedSearch['filters']
): Promise<boolean> => {
  try {
    const search: SavedSearch = {
      id: Date.now().toString(),
      name,
      filters,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if we've reached the limit
        const existing = await getSavedSearches();
        if (existing.length >= MAX_SAVED_SEARCHES) {
          // Delete the oldest one
          const oldest = existing[existing.length - 1];
          await deleteSearch(oldest.id);
        }

        const { error } = await supabase
          .from('saved_searches')
          .insert({
            user_id: user.id,
            name: search.name,
            filters: search.filters as any,
            created_at: search.createdAt,
            last_used: search.lastUsed,
          } as any);

        if (!error) {
          devLog('[saveSearch] Saved to Supabase');
          return true;
        }
      }
    }

    // Fallback to AsyncStorage
    const existing = await getSavedSearches();
    if (existing.length >= MAX_SAVED_SEARCHES) {
      // Remove the oldest one
      existing.pop();
    }
    existing.unshift(search);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    devLog('[saveSearch] Saved to AsyncStorage');
    return true;
  } catch (error) {
    errorLog('Error saving search', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
};

/**
 * Delete a saved search
 */
export const deleteSearch = async (id: string): Promise<boolean> => {
  try {
    if (isSupabaseConfigured()) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('saved_searches')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (!error) {
          devLog('[deleteSearch] Deleted from Supabase');
          return true;
        }
      }
    }

    // Fallback to AsyncStorage
    const existing = await getSavedSearches();
    const filtered = existing.filter((s) => s.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    devLog('[deleteSearch] Deleted from AsyncStorage');
    return true;
  } catch (error) {
    errorLog('Error deleting search', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
};

/**
 * Update last used timestamp
 */
export const updateLastUsed = async (id: string): Promise<boolean> => {
  try {
    if (isSupabaseConfigured()) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await (supabase as any)
          .from('saved_searches')
          .update({ last_used: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', user.id);

        if (!error) {
          return true;
        }
      }
    }

    // Fallback to AsyncStorage
    const existing = await getSavedSearches();
    const updated = existing.map((s) =>
      s.id === id ? { ...s, lastUsed: new Date().toISOString() } : s
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    errorLog('Error updating last used', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
};

