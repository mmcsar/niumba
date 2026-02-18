// Niumba - Saved Properties Hook (Favorites)
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SAMPLE_PROPERTIES } from '../constants/data';

const LOCAL_SAVED_KEY = '@niumba_saved_properties';

export const useSavedProperties = () => {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved properties
  const loadSavedProperties = useCallback(async () => {
    setIsLoading(true);
    
    try {
      if (user && isSupabaseConfigured()) {
        // Load from Supabase for logged-in users
        const { data, error } = await supabase
          .from('saved_properties')
          .select('property_id, properties(*)')
          .eq('user_id', user.id);

        if (error) throw error;

        const ids = (data as any)?.map((item: any) => item.property_id) || [];
        const properties = (data as any)?.map((item: any) => item.properties).filter(Boolean) || [];
        
        setSavedIds(ids);
        setSavedProperties(properties);
      } else {
        // Load from local storage for guests
        const stored = await AsyncStorage.getItem(LOCAL_SAVED_KEY);
        const ids = stored ? JSON.parse(stored) : [];
        setSavedIds(ids);
        
        // Get properties from sample data
        const properties = SAMPLE_PROPERTIES.filter(p => ids.includes(p.id));
        setSavedProperties(properties);
      }
    } catch (error) {
      console.error('Error loading saved properties:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSavedProperties();
  }, [loadSavedProperties]);

  // Check if property is saved
  const isSaved = useCallback((propertyId: string) => {
    return savedIds.includes(propertyId);
  }, [savedIds]);

  // Toggle save/unsave
  const toggleSave = useCallback(async (propertyId: string) => {
    const currentlySaved = isSaved(propertyId);
    
    try {
      if (user && isSupabaseConfigured()) {
        // Supabase operations for logged-in users
        if (currentlySaved) {
          await supabase
            .from('saved_properties')
            .delete()
            .eq('user_id', user.id)
            .eq('property_id', propertyId);
        } else {
          await supabase
            .from('saved_properties')
            .insert({ user_id: user.id, property_id: propertyId } as any);
        }
      } else {
        // Local storage for guests
        const newIds = currentlySaved
          ? savedIds.filter(id => id !== propertyId)
          : [...savedIds, propertyId];
        
        await AsyncStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(newIds));
      }
      
      // Reload saved properties
      await loadSavedProperties();
      
      return !currentlySaved; // Return new saved state
    } catch (error) {
      console.error('Error toggling save:', error);
      return currentlySaved; // Return current state on error
    }
  }, [user, savedIds, isSaved, loadSavedProperties]);

  // Save property
  const saveProperty = useCallback(async (propertyId: string) => {
    if (isSaved(propertyId)) return true;
    return toggleSave(propertyId);
  }, [isSaved, toggleSave]);

  // Unsave property
  const unsaveProperty = useCallback(async (propertyId: string) => {
    if (!isSaved(propertyId)) return false;
    return toggleSave(propertyId);
  }, [isSaved, toggleSave]);

  // Clear all saved (for logout)
  const clearSaved = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(LOCAL_SAVED_KEY);
      setSavedIds([]);
      setSavedProperties([]);
    } catch (error) {
      console.error('Error clearing saved properties:', error);
    }
  }, []);

  return {
    savedIds,
    savedProperties,
    savedCount: savedIds.length,
    isLoading,
    isSaved,
    toggleSave,
    saveProperty,
    unsaveProperty,
    clearSaved,
    refresh: loadSavedProperties,
  };
};

export default useSavedProperties;
