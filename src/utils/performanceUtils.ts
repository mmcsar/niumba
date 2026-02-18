// Niumba - Performance Utilities
// Helper functions for performance optimization

import { useCallback, useMemo, useRef } from 'react';

/**
 * Debounce function to limit function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function to limit function calls
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Memoize expensive calculations
 */
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

/**
 * Lazy load images with intersection observer pattern
 */
export const useLazyImage = (uri: string | null, threshold: number = 0.1) => {
  const [shouldLoad, setShouldLoad] = React.useState(false);
  const imageRef = useRef<View>(null);

  useEffect(() => {
    if (!uri || shouldLoad) return;

    // Simple timeout-based lazy loading (can be enhanced with IntersectionObserver in web)
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [uri, shouldLoad]);

  return { shouldLoad, imageRef };
};

/**
 * Optimize FlatList performance
 */
export const getOptimizedFlatListProps = () => ({
  removeClippedSubviews: true,
  maxToRenderPerBatch: 10,
  updateCellsBatchingPeriod: 50,
  initialNumToRender: 10,
  windowSize: 10,
  getItemLayout: undefined, // Can be provided if items have fixed height
});

/**
 * Batch state updates
 */
export const useBatchedUpdates = () => {
  const updatesRef = useRef<(() => void)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const batchUpdate = useCallback((update: () => void) => {
    updatesRef.current.push(update);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      updatesRef.current.forEach(update => update());
      updatesRef.current = [];
    }, 16); // ~60fps
  }, []);

  return batchUpdate;
};

/**
 * Preload images
 */
export const preloadImages = async (uris: string[]): Promise<void> => {
  // In React Native, we can use Image.prefetch
  await Promise.all(
    uris.map(uri => {
      return new Promise<void>((resolve, reject) => {
        const Image = require('react-native').Image;
        Image.prefetch(uri)
          .then(() => resolve())
          .catch(() => resolve()); // Ignore errors
      });
    })
  );
};

/**
 * Calculate optimal image dimensions
 */
export const getOptimalImageSize = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = maxWidth;
  let height = maxWidth / aspectRatio;
  
  if (height > maxHeight) {
    height = maxHeight;
    width = maxHeight * aspectRatio;
  }
  
  return { width: Math.round(width), height: Math.round(height) };
};

