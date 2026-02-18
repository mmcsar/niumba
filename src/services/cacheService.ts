// Niumba - Advanced Cache Service
// Multi-layer caching with TTL, LRU eviction, and persistence

import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache configuration
const CACHE_CONFIG = {
  maxMemoryItems: 100,
  maxStorageItems: 500,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  cleanupInterval: 60 * 1000, // 1 minute
  prefix: '@niumba_cache_',
};

// TTL presets (in milliseconds)
export const CACHE_TTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 30 * 60 * 1000,      // 30 minutes
  HOUR: 60 * 60 * 1000,      // 1 hour
  DAY: 24 * 60 * 60 * 1000,  // 24 hours
  WEEK: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  size?: number;
}

interface CacheStats {
  memoryItems: number;
  memoryHits: number;
  memoryMisses: number;
  storageItems: number;
  storageHits: number;
  storageMisses: number;
  totalSize: number;
}

class CacheService {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private stats: CacheStats = {
    memoryItems: 0,
    memoryHits: 0,
    memoryMisses: 0,
    storageItems: 0,
    storageHits: 0,
    storageMisses: 0,
    totalSize: 0,
  };
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupTimer();
  }

  /**
   * Get item from cache (memory first, then storage)
   */
  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isValid(memoryEntry)) {
      memoryEntry.hits++;
      this.stats.memoryHits++;
      return memoryEntry.data as T;
    }

    this.stats.memoryMisses++;

    // Try persistent storage
    try {
      const storageKey = `${CACHE_CONFIG.prefix}${key}`;
      const stored = await AsyncStorage.getItem(storageKey);
      
      if (stored) {
        const entry: CacheEntry<T> = JSON.parse(stored);
        
        if (this.isValid(entry)) {
          // Promote to memory cache
          this.setMemory(key, entry.data, entry.ttl - (Date.now() - entry.timestamp));
          this.stats.storageHits++;
          return entry.data;
        } else {
          // Clean up expired entry
          await AsyncStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error('Cache storage read error:', error);
    }

    this.stats.storageMisses++;
    return null;
  }

  /**
   * Set item in cache
   */
  async set<T>(
    key: string,
    data: T,
    ttl: number = CACHE_CONFIG.defaultTTL,
    persistToStorage: boolean = true
  ): Promise<void> {
    // Set in memory
    this.setMemory(key, data, ttl);

    // Persist to storage if needed
    if (persistToStorage) {
      try {
        const entry: CacheEntry<T> = {
          data,
          timestamp: Date.now(),
          ttl,
          hits: 0,
          size: JSON.stringify(data).length,
        };
        
        const storageKey = `${CACHE_CONFIG.prefix}${key}`;
        await AsyncStorage.setItem(storageKey, JSON.stringify(entry));
        this.stats.storageItems++;
      } catch (error) {
        console.error('Cache storage write error:', error);
      }
    }
  }

  /**
   * Set item in memory only
   */
  private setMemory<T>(key: string, data: T, ttl: number): void {
    // LRU eviction if needed
    if (this.memoryCache.size >= CACHE_CONFIG.maxMemoryItems) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
      size: JSON.stringify(data).length,
    };

    this.memoryCache.set(key, entry);
    this.stats.memoryItems = this.memoryCache.size;
  }

  /**
   * Delete item from cache
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    
    try {
      const storageKey = `${CACHE_CONFIG.prefix}${key}`;
      await AsyncStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Delete items matching a pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);

    // Clear from memory
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear from storage
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(
        (k) => k.startsWith(CACHE_CONFIG.prefix) && regex.test(k.replace(CACHE_CONFIG.prefix, ''))
      );
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache pattern delete error:', error);
    }
  }

  /**
   * Get or set with factory function
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = CACHE_CONFIG.defaultTTL
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    await this.set(key, data, ttl);
    return data;
  }

  /**
   * Memoize a function
   */
  memoize<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    keyGenerator: (...args: Parameters<T>) => string,
    ttl: number = CACHE_CONFIG.defaultTTL
  ): T {
    return (async (...args: Parameters<T>) => {
      const key = keyGenerator(...args);
      return this.getOrSet(key, () => fn(...args), ttl);
    }) as T;
  }

  /**
   * Check if entry is still valid
   */
  private isValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruHits = Infinity;
    let lruTime = Infinity;

    for (const [key, entry] of this.memoryCache.entries()) {
      // Prefer evicting items with fewer hits and older timestamp
      const score = entry.hits + (Date.now() - entry.timestamp) / 1000;
      if (entry.hits < lruHits || (entry.hits === lruHits && entry.timestamp < lruTime)) {
        lruKey = key;
        lruHits = entry.hits;
        lruTime = entry.timestamp;
      }
    }

    if (lruKey) {
      this.memoryCache.delete(lruKey);
    }
  }

  /**
   * Clean up expired entries
   */
  private async cleanup(): Promise<void> {
    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isValid(entry)) {
        this.memoryCache.delete(key);
      }
    }

    // Clean storage cache
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter((k) => k.startsWith(CACHE_CONFIG.prefix));
      
      const entries = await AsyncStorage.multiGet(cacheKeys);
      const keysToDelete: string[] = [];

      for (const [key, value] of entries) {
        if (value) {
          try {
            const entry: CacheEntry<any> = JSON.parse(value);
            if (!this.isValid(entry)) {
              keysToDelete.push(key);
            }
          } catch {
            keysToDelete.push(key);
          }
        }
      }

      if (keysToDelete.length > 0) {
        await AsyncStorage.multiRemove(keysToDelete);
      }
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }

    this.stats.memoryItems = this.memoryCache.size;
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, CACHE_CONFIG.cleanupInterval);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter((k) => k.startsWith(CACHE_CONFIG.prefix));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }

    this.resetStats();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      memoryItems: this.memoryCache.size,
      memoryHits: 0,
      memoryMisses: 0,
      storageItems: 0,
      storageHits: 0,
      storageMisses: 0,
      totalSize: 0,
    };
  }

  /**
   * Get cache hit ratio
   */
  getHitRatio(): number {
    const totalHits = this.stats.memoryHits + this.stats.storageHits;
    const totalMisses = this.stats.memoryMisses + this.stats.storageMisses;
    const total = totalHits + totalMisses;
    
    return total > 0 ? totalHits / total : 0;
  }

  /**
   * Warm up cache with initial data
   */
  async warmUp<T>(entries: Array<{ key: string; data: T; ttl?: number }>): Promise<void> {
    await Promise.all(
      entries.map(({ key, data, ttl }) => this.set(key, data, ttl))
    );
  }

  /**
   * Destroy cache service
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.memoryCache.clear();
  }
}

// Singleton instance
export const cache = new CacheService();

// Convenience functions
export const cacheGet = <T>(key: string) => cache.get<T>(key);
export const cacheSet = <T>(key: string, data: T, ttl?: number) => cache.set(key, data, ttl);
export const cacheDelete = (key: string) => cache.delete(key);
export const cacheGetOrSet = <T>(key: string, factory: () => Promise<T>, ttl?: number) => 
  cache.getOrSet(key, factory, ttl);
export const cacheClear = () => cache.clear();

export default cache;

