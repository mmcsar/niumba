// Niumba - Offline Mode Hook
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Property } from '../types';

const CACHE_KEYS = {
  PROPERTIES: '@niumba_cached_properties',
  SAVED_PROPERTIES: '@niumba_cached_saved',
  LAST_SYNC: '@niumba_last_sync',
  USER_PREFERENCES: '@niumba_user_prefs',
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface OfflineState {
  isOnline: boolean;
  isOfflineMode: boolean;
  lastSyncTime: Date | null;
  cachedPropertiesCount: number;
}

interface UseOfflineModeReturn {
  state: OfflineState;
  cacheProperties: (properties: Property[]) => Promise<void>;
  getCachedProperties: () => Promise<Property[]>;
  cacheProperty: (property: Property) => Promise<void>;
  getCachedProperty: (id: string) => Promise<Property | null>;
  cacheSavedProperties: (ids: string[]) => Promise<void>;
  getCachedSavedProperties: () => Promise<string[]>;
  clearCache: () => Promise<void>;
  syncIfNeeded: () => Promise<boolean>;
  forceSync: () => Promise<void>;
}

export const useOfflineMode = (): UseOfflineModeReturn => {
  const [state, setState] = useState<OfflineState>({
    isOnline: true,
    isOfflineMode: false,
    lastSyncTime: null,
    cachedPropertiesCount: 0,
  });

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netState: NetInfoState) => {
      const online = netState.isConnected && netState.isInternetReachable;
      setState(prev => ({
        ...prev,
        isOnline: online ?? true,
        isOfflineMode: !online,
      }));
    });

    // Initial check
    NetInfo.fetch().then((netState) => {
      const online = netState.isConnected && netState.isInternetReachable;
      setState(prev => ({
        ...prev,
        isOnline: online ?? true,
        isOfflineMode: !online,
      }));
    });

    // Load last sync time
    loadLastSyncTime();
    loadCachedCount();

    return () => unsubscribe();
  }, []);

  const loadLastSyncTime = async () => {
    try {
      const lastSync = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
      if (lastSync) {
        setState(prev => ({
          ...prev,
          lastSyncTime: new Date(lastSync),
        }));
      }
    } catch (error) {
      console.error('Error loading last sync time:', error);
    }
  };

  const loadCachedCount = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.PROPERTIES);
      if (cached) {
        const properties = JSON.parse(cached);
        setState(prev => ({
          ...prev,
          cachedPropertiesCount: properties.length,
        }));
      }
    } catch (error) {
      console.error('Error loading cached count:', error);
    }
  };

  const cacheProperties = useCallback(async (properties: Property[]) => {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.PROPERTIES, JSON.stringify(properties));
      await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
      
      setState(prev => ({
        ...prev,
        lastSyncTime: new Date(),
        cachedPropertiesCount: properties.length,
      }));
      
      console.log(`Cached ${properties.length} properties`);
    } catch (error) {
      console.error('Error caching properties:', error);
    }
  }, []);

  const getCachedProperties = useCallback(async (): Promise<Property[]> => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.PROPERTIES);
      if (cached) {
        return JSON.parse(cached);
      }
      return [];
    } catch (error) {
      console.error('Error getting cached properties:', error);
      return [];
    }
  }, []);

  const cacheProperty = useCallback(async (property: Property) => {
    try {
      const cached = await getCachedProperties();
      const existingIndex = cached.findIndex(p => p.id === property.id);
      
      if (existingIndex >= 0) {
        cached[existingIndex] = property;
      } else {
        cached.push(property);
      }
      
      await AsyncStorage.setItem(CACHE_KEYS.PROPERTIES, JSON.stringify(cached));
      setState(prev => ({
        ...prev,
        cachedPropertiesCount: cached.length,
      }));
    } catch (error) {
      console.error('Error caching property:', error);
    }
  }, [getCachedProperties]);

  const getCachedProperty = useCallback(async (id: string): Promise<Property | null> => {
    try {
      const cached = await getCachedProperties();
      return cached.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Error getting cached property:', error);
      return null;
    }
  }, [getCachedProperties]);

  const cacheSavedProperties = useCallback(async (ids: string[]) => {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.SAVED_PROPERTIES, JSON.stringify(ids));
    } catch (error) {
      console.error('Error caching saved properties:', error);
    }
  }, []);

  const getCachedSavedProperties = useCallback(async (): Promise<string[]> => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.SAVED_PROPERTIES);
      if (cached) {
        return JSON.parse(cached);
      }
      return [];
    } catch (error) {
      console.error('Error getting cached saved properties:', error);
      return [];
    }
  }, []);

  const clearCache = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        CACHE_KEYS.PROPERTIES,
        CACHE_KEYS.SAVED_PROPERTIES,
        CACHE_KEYS.LAST_SYNC,
      ]);
      
      setState(prev => ({
        ...prev,
        lastSyncTime: null,
        cachedPropertiesCount: 0,
      }));
      
      console.log('Cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, []);

  const syncIfNeeded = useCallback(async (): Promise<boolean> => {
    if (!state.isOnline) return false;
    
    if (state.lastSyncTime) {
      const timeSinceSync = Date.now() - state.lastSyncTime.getTime();
      if (timeSinceSync < CACHE_DURATION) {
        return false; // No sync needed
      }
    }
    
    return true; // Sync needed
  }, [state.isOnline, state.lastSyncTime]);

  const forceSync = useCallback(async () => {
    // This would be called to force a sync with the server
    // Implementation depends on your data fetching logic
    await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
    setState(prev => ({
      ...prev,
      lastSyncTime: new Date(),
    }));
  }, []);

  return {
    state,
    cacheProperties,
    getCachedProperties,
    cacheProperty,
    getCachedProperty,
    cacheSavedProperties,
    getCachedSavedProperties,
    clearCache,
    syncIfNeeded,
    forceSync,
  };
};

export default useOfflineMode;

