// Niumba - Intelligent Prefetch Service
// Predictive data loading based on user behavior

import { AppState, AppStateStatus } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cache, CACHE_TTL } from './cacheService';
import { preloadImages } from './imageOptimizationService';

// Prefetch configuration
const PREFETCH_CONFIG = {
  maxConcurrent: 2,
  minBattery: 20, // Don't prefetch below 20% battery
  wifiOnly: false, // Also prefetch on cellular
  idleDelay: 2000, // Wait 2s of idle before prefetching
  maxPrefetchItems: 10,
  storageKey: '@niumba_prefetch_stats',
};

// Prefetch priority
export enum PrefetchPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
}

// Prefetch task
interface PrefetchTask {
  id: string;
  type: 'property' | 'properties' | 'images' | 'profile' | 'custom';
  priority: PrefetchPriority;
  data: any;
  fetchFn: () => Promise<any>;
}

// User behavior stats for prediction
interface UserStats {
  viewedPropertyTypes: Record<string, number>;
  viewedCities: Record<string, number>;
  viewedPriceRanges: Record<string, number>;
  lastViewedPropertyIds: string[];
  searchHistory: string[];
  lastActiveTime: number;
}

class PrefetchService {
  private queue: PrefetchTask[] = [];
  private isProcessing: boolean = false;
  private activeCount: number = 0;
  private idleTimer: NodeJS.Timeout | null = null;
  private networkState: NetInfoState | null = null;
  private appState: AppStateStatus = 'active';
  private userStats: UserStats = {
    viewedPropertyTypes: {},
    viewedCities: {},
    viewedPriceRanges: {},
    lastViewedPropertyIds: [],
    searchHistory: [],
    lastActiveTime: Date.now(),
  };

  constructor() {
    this.init();
  }

  private async init() {
    // Load user stats
    await this.loadUserStats();

    // Listen to app state
    AppState.addEventListener('change', this.handleAppStateChange);

    // Listen to network state
    NetInfo.addEventListener(this.handleNetworkChange);

    // Get initial network state
    const state = await NetInfo.fetch();
    this.networkState = state;
  }

  private handleAppStateChange = (nextState: AppStateStatus) => {
    this.appState = nextState;

    if (nextState === 'active') {
      // App came to foreground - start idle timer
      this.startIdleTimer();
    } else {
      // App went to background - stop prefetching
      this.stopIdleTimer();
      this.pause();
    }
  };

  private handleNetworkChange = (state: NetInfoState) => {
    this.networkState = state;

    // Resume prefetching if we got good connection
    if (this.shouldPrefetch()) {
      this.resume();
    }
  };

  private startIdleTimer() {
    this.stopIdleTimer();
    this.idleTimer = setTimeout(() => {
      if (this.shouldPrefetch()) {
        this.processPredictivePrefetch();
      }
    }, PREFETCH_CONFIG.idleDelay);
  }

  private stopIdleTimer() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  private shouldPrefetch(): boolean {
    // Check app state
    if (this.appState !== 'active') return false;

    // Check network
    if (!this.networkState?.isConnected) return false;

    // Check if WiFi only mode
    if (PREFETCH_CONFIG.wifiOnly && this.networkState?.type !== 'wifi') {
      return false;
    }

    return true;
  }

  // ============================================
  // PUBLIC API
  // ============================================

  /**
   * Add a prefetch task
   */
  addTask(task: Omit<PrefetchTask, 'id'>): string {
    const id = `prefetch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullTask: PrefetchTask = {
      ...task,
      id,
    };

    // Insert based on priority
    const insertIndex = this.queue.findIndex((t) => t.priority < task.priority);
    if (insertIndex === -1) {
      this.queue.push(fullTask);
    } else {
      this.queue.splice(insertIndex, 0, fullTask);
    }

    // Start processing if conditions are met
    if (this.shouldPrefetch()) {
      this.processQueue();
    }

    return id;
  }

  /**
   * Prefetch a property detail
   */
  prefetchProperty(propertyId: string): string {
    return this.addTask({
      type: 'property',
      priority: PrefetchPriority.MEDIUM,
      data: { propertyId },
      fetchFn: async () => {
        const { getPropertyById } = await import('./queryService');
        return getPropertyById(propertyId);
      },
    });
  }

  /**
   * Prefetch multiple properties
   */
  prefetchProperties(options: {
    city?: string;
    type?: string;
    limit?: number;
  }): string {
    return this.addTask({
      type: 'properties',
      priority: PrefetchPriority.LOW,
      data: options,
      fetchFn: async () => {
        const { getProperties } = await import('./queryService');
        return getProperties({
          pageSize: options.limit || 10,
          filters: {
            city: options.city,
            type: options.type,
          },
        });
      },
    });
  }

  /**
   * Prefetch images
   */
  prefetchImages(urls: string[]): string {
    return this.addTask({
      type: 'images',
      priority: PrefetchPriority.LOW,
      data: { urls },
      fetchFn: async () => {
        await preloadImages(urls.slice(0, PREFETCH_CONFIG.maxPrefetchItems));
        return { preloaded: urls.length };
      },
    });
  }

  /**
   * Record user behavior for predictions
   */
  recordPropertyView(property: {
    id: string;
    type: string;
    city: string;
    price: number;
  }) {
    // Update stats
    this.userStats.viewedPropertyTypes[property.type] = 
      (this.userStats.viewedPropertyTypes[property.type] || 0) + 1;
    
    this.userStats.viewedCities[property.city] = 
      (this.userStats.viewedCities[property.city] || 0) + 1;

    // Determine price range
    const priceRange = this.getPriceRange(property.price);
    this.userStats.viewedPriceRanges[priceRange] = 
      (this.userStats.viewedPriceRanges[priceRange] || 0) + 1;

    // Add to recent views (keep last 20)
    this.userStats.lastViewedPropertyIds = [
      property.id,
      ...this.userStats.lastViewedPropertyIds.filter((id) => id !== property.id),
    ].slice(0, 20);

    this.userStats.lastActiveTime = Date.now();

    // Save stats
    this.saveUserStats();

    // Start idle timer for predictive prefetch
    this.startIdleTimer();
  }

  /**
   * Record search
   */
  recordSearch(query: string) {
    if (!query.trim()) return;

    this.userStats.searchHistory = [
      query,
      ...this.userStats.searchHistory.filter((q) => q !== query),
    ].slice(0, 10);

    this.saveUserStats();
  }

  /**
   * Get prefetch suggestions based on user behavior
   */
  getSuggestions(): {
    cities: string[];
    types: string[];
    priceRanges: string[];
  } {
    const sortByCount = (obj: Record<string, number>) =>
      Object.entries(obj)
        .sort(([, a], [, b]) => b - a)
        .map(([key]) => key);

    return {
      cities: sortByCount(this.userStats.viewedCities).slice(0, 3),
      types: sortByCount(this.userStats.viewedPropertyTypes).slice(0, 3),
      priceRanges: sortByCount(this.userStats.viewedPriceRanges).slice(0, 3),
    };
  }

  /**
   * Clear prefetch queue
   */
  clear() {
    this.queue = [];
  }

  /**
   * Pause prefetching
   */
  pause() {
    this.isProcessing = false;
  }

  /**
   * Resume prefetching
   */
  resume() {
    this.isProcessing = true;
    this.processQueue();
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private getPriceRange(price: number): string {
    if (price < 50000) return '0-50k';
    if (price < 100000) return '50k-100k';
    if (price < 200000) return '100k-200k';
    if (price < 500000) return '200k-500k';
    return '500k+';
  }

  private async processQueue() {
    if (!this.isProcessing) return;
    if (this.activeCount >= PREFETCH_CONFIG.maxConcurrent) return;
    if (this.queue.length === 0) return;

    const task = this.queue.shift();
    if (!task) return;

    this.activeCount++;

    try {
      await task.fetchFn();
    } catch (error) {
      // Silently fail - prefetching is not critical
      console.log('Prefetch failed:', task.type, error);
    } finally {
      this.activeCount--;
      
      // Continue processing
      if (this.shouldPrefetch() && this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 100);
      }
    }
  }

  private async processPredictivePrefetch() {
    const suggestions = this.getSuggestions();

    // Prefetch properties from most viewed city
    if (suggestions.cities.length > 0) {
      this.prefetchProperties({
        city: suggestions.cities[0],
        limit: 5,
      });
    }

    // Prefetch properties of most viewed type
    if (suggestions.types.length > 0) {
      this.prefetchProperties({
        type: suggestions.types[0],
        limit: 5,
      });
    }

    // Start processing
    if (this.shouldPrefetch()) {
      this.isProcessing = true;
      this.processQueue();
    }
  }

  private async loadUserStats() {
    try {
      const stored = await AsyncStorage.getItem(PREFETCH_CONFIG.storageKey);
      if (stored) {
        this.userStats = { ...this.userStats, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  }

  private async saveUserStats() {
    try {
      await AsyncStorage.setItem(
        PREFETCH_CONFIG.storageKey,
        JSON.stringify(this.userStats)
      );
    } catch (error) {
      console.error('Failed to save user stats:', error);
    }
  }

  /**
   * Destroy service
   */
  destroy() {
    this.stopIdleTimer();
    this.pause();
    this.queue = [];
  }
}

// Singleton instance
export const prefetch = new PrefetchService();

export default prefetch;

