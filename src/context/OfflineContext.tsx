// Niumba - Offline Context Provider
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Property } from '../types';
import { SAMPLE_PROPERTIES } from '../constants/data';

interface OfflineContextType {
  isOnline: boolean;
  isOfflineMode: boolean;
  lastSyncTime: Date | null;
  cachedPropertiesCount: number;
  cacheProperties: (properties: Property[]) => Promise<void>;
  getCachedProperties: () => Promise<Property[]>;
  getCachedProperty: (id: string) => Promise<Property | null>;
  clearCache: () => Promise<void>;
  refreshConnection: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

const CACHE_KEYS = {
  PROPERTIES: '@niumba_properties',
  LAST_SYNC: '@niumba_sync',
};

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [cachedPropertiesCount, setCachedPropertiesCount] = useState(0);

  useEffect(() => {
    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online ?? true);
    });

    // Initial network check
    NetInfo.fetch().then(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online ?? true);
    });

    // Load cached data info
    loadCacheInfo();

    // Initial cache of mock data for demo
    initializeCache();

    return () => unsubscribe();
  }, []);

  const loadCacheInfo = async () => {
    try {
      const [syncTime, properties] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC),
        AsyncStorage.getItem(CACHE_KEYS.PROPERTIES),
      ]);

      if (syncTime) {
        setLastSyncTime(new Date(syncTime));
      }

      if (properties) {
        const parsed = JSON.parse(properties);
        setCachedPropertiesCount(parsed.length);
      }
    } catch (error) {
      console.error('Error loading cache info:', error);
    }
  };

  const initializeCache = async () => {
    try {
      const existing = await AsyncStorage.getItem(CACHE_KEYS.PROPERTIES);
      if (!existing && SAMPLE_PROPERTIES && SAMPLE_PROPERTIES.length > 0) {
        // Cache mock data initially for demo
        const dataToCache = JSON.stringify(SAMPLE_PROPERTIES);
        if (dataToCache && dataToCache !== 'undefined') {
          await AsyncStorage.setItem(CACHE_KEYS.PROPERTIES, dataToCache);
          await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
          setCachedPropertiesCount(SAMPLE_PROPERTIES.length);
          setLastSyncTime(new Date());
        }
      }
    } catch (error) {
      console.error('Error initializing cache:', error);
    }
  };

  const cacheProperties = useCallback(async (properties: Property[]) => {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.PROPERTIES, JSON.stringify(properties));
      await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
      setCachedPropertiesCount(properties.length);
      setLastSyncTime(new Date());
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
      // Return mock data as fallback
      return SAMPLE_PROPERTIES;
    } catch (error) {
      console.error('Error getting cached properties:', error);
      return SAMPLE_PROPERTIES;
    }
  }, []);

  const getCachedProperty = useCallback(async (id: string): Promise<Property | null> => {
    try {
      const properties = await getCachedProperties();
      return properties.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Error getting cached property:', error);
      return null;
    }
  }, [getCachedProperties]);

  const clearCache = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([CACHE_KEYS.PROPERTIES, CACHE_KEYS.LAST_SYNC]);
      setCachedPropertiesCount(0);
      setLastSyncTime(null);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, []);

  const refreshConnection = useCallback(async () => {
    const state = await NetInfo.fetch();
    const online = state.isConnected && state.isInternetReachable;
    setIsOnline(online ?? true);
  }, []);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isOfflineMode: !isOnline,
        lastSyncTime,
        cachedPropertiesCount,
        cacheProperties,
        getCachedProperties,
        getCachedProperty,
        clearCache,
        refreshConnection,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export default OfflineContext;

