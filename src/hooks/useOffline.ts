// Niumba - Offline Mode Hook
// Gestion du mode hors ligne avec cache et synchronisation
import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export interface OfflineStatus {
  isOnline: boolean;
  isOffline: boolean;
  connectionType: string | null;
  isConnected: boolean | null;
}

const CACHE_PREFIX = '@niumba_cache_';
const SYNC_QUEUE_KEY = '@niumba_sync_queue';

// Types pour la queue de synchronisation
interface SyncItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
}

/**
 * Hook pour gérer le mode offline
 */
export const useOffline = () => {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: true,
    isOffline: false,
    connectionType: null,
    isConnected: null,
  });

  // Surveiller la connexion
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected ?? false;
      setStatus({
        isOnline,
        isOffline: !isOnline,
        connectionType: state.type,
        isConnected: state.isConnected,
      });

      // Si on revient en ligne, synchroniser
      if (isOnline) {
        syncPendingChanges();
      }
    });

    // Vérifier l'état initial
    NetInfo.fetch().then((state) => {
      const isOnline = state.isConnected ?? false;
      setStatus({
        isOnline,
        isOffline: !isOnline,
        connectionType: state.type,
        isConnected: state.isConnected,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Sauvegarder des données dans le cache
   */
  const cacheData = useCallback(async <T>(key: string, data: T): Promise<void> => {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }, []);

  /**
   * Récupérer des données du cache
   */
  const getCachedData = useCallback(async <T>(key: string, maxAge?: number): Promise<T | null> => {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);

      // Vérifier l'âge du cache
      if (maxAge && Date.now() - timestamp > maxAge) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      return data as T;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }, []);

  /**
   * Ajouter une action à la queue de synchronisation
   */
  const queueSync = useCallback(async (item: Omit<SyncItem, 'id' | 'timestamp'>): Promise<void> => {
    try {
      const queue = await getSyncQueue();
      const syncItem: SyncItem = {
        id: `sync_${Date.now()}_${Math.random()}`,
        ...item,
        timestamp: Date.now(),
      };
      queue.push(syncItem);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error queueing sync:', error);
    }
  }, []);

  /**
   * Récupérer la queue de synchronisation
   */
  const getSyncQueue = useCallback(async (): Promise<SyncItem[]> => {
    try {
      const queue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }, []);

  /**
   * Synchroniser les changements en attente
   */
  const syncPendingChanges = useCallback(async (): Promise<void> => {
    if (!status.isOnline || !isSupabaseConfigured()) return;

    try {
      const queue = await getSyncQueue();
      if (queue.length === 0) return;

      const syncedItems: string[] = [];
      
      for (const item of queue) {
        try {
          let result;
          
          switch (item.type) {
            case 'create':
              result = await (supabase as any).from(item.table).insert(item.data).select();
              break;
            case 'update':
              result = await (supabase as any)
                .from(item.table)
                .update(item.data)
                .eq('id', item.data.id);
              break;
            case 'delete':
              result = await (supabase as any).from(item.table).delete().eq('id', item.data.id);
              break;
          }

          if (result && !result.error) {
            syncedItems.push(item.id);
          }
        } catch (error) {
          console.error(`Error syncing item ${item.id}:`, error);
        }
      }

      // Retirer les items synchronisés de la queue
      if (syncedItems.length > 0) {
        const remainingQueue = queue.filter((item) => !syncedItems.includes(item.id));
        await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remainingQueue));
      }
    } catch (error) {
      console.error('Error syncing pending changes:', error);
    }
  }, [status.isOnline, getSyncQueue]);

  /**
   * Vider le cache
   */
  const clearCache = useCallback(async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, []);

  /**
   * Vider la queue de synchronisation
   */
  const clearSyncQueue = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    } catch (error) {
      console.error('Error clearing sync queue:', error);
    }
  }, []);

  return {
    ...status,
    cacheData,
    getCachedData,
    queueSync,
    syncPendingChanges,
    clearCache,
    clearSyncQueue,
  };
};

/**
 * Hook pour récupérer des données avec cache offline
 */
export const useOfflineData = <T>(
  key: string,
  fetchFn: () => Promise<T | null>,
  options?: {
    maxCacheAge?: number; // en millisecondes
    enabled?: boolean;
  }
) => {
  const { isOnline, getCachedData, cacheData } = useOffline();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (options?.enabled === false) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Essayer de récupérer depuis le cache d'abord
      const cached = await getCachedData<T>(key, options?.maxCacheAge);
      if (cached) {
        setData(cached);
        setLoading(false);
      }

      // Si en ligne, récupérer les données fraîches
      if (isOnline) {
        const freshData = await fetchFn();
        if (freshData) {
          setData(freshData);
          await cacheData(key, freshData);
        }
      } else if (!cached) {
        // Si hors ligne et pas de cache, erreur
        setError(new Error('No cached data available'));
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
    }
  }, [key, fetchFn, isOnline, getCachedData, cacheData, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useOffline;


