// Niumba - Image Optimization Service
// Optimizes images for fast loading and reduced storage

import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const getCacheDirectory = (): string =>
  (FileSystem as { cacheDirectory?: string }).cacheDirectory ?? '';

// Image quality presets
export const IMAGE_PRESETS = {
  thumbnail: { width: 150, quality: 0.6 },
  card: { width: 400, quality: 0.7 },
  detail: { width: 800, quality: 0.8 },
  full: { width: 1200, quality: 0.85 },
  original: { width: 2000, quality: 0.9 },
} as const;

export type ImagePreset = keyof typeof IMAGE_PRESETS;

interface OptimizedImage {
  uri: string;
  width: number;
  height: number;
  size: number; // in bytes
  format: 'jpeg' | 'png' | 'webp';
}

interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png';
  preserveAspectRatio?: boolean;
}

/**
 * Compress and resize an image
 */
export const optimizeImage = async (
  uri: string,
  options: OptimizationOptions = {}
): Promise<OptimizedImage> => {
  const {
    maxWidth = 1200,
    maxHeight,
    quality = 0.8,
    format = 'jpeg',
    preserveAspectRatio = true,
  } = options;

  try {
    // Build resize action
    const actions: ImageManipulator.Action[] = [];
    
    if (maxWidth || maxHeight) {
      const resize: { width?: number; height?: number } = {};
      if (maxWidth) resize.width = maxWidth;
      if (maxHeight && !preserveAspectRatio) resize.height = maxHeight;
      actions.push({ resize });
    }

    // Manipulate image
    const result = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      {
        compress: quality,
        format: format === 'png' 
          ? ImageManipulator.SaveFormat.PNG 
          : ImageManipulator.SaveFormat.JPEG,
      }
    );

    // Get file size
    let size = 0;
    try {
      const fileInfo = await FileSystem.getInfoAsync(result.uri);
      size = (fileInfo as any).size || 0;
    } catch {
      // Size not available
    }

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      size,
      format,
    };
  } catch (error) {
    console.error('Image optimization failed:', error);
    // Return original if optimization fails
    return {
      uri,
      width: 0,
      height: 0,
      size: 0,
      format,
    };
  }
};

/**
 * Optimize image using a preset
 */
export const optimizeWithPreset = async (
  uri: string,
  preset: ImagePreset
): Promise<OptimizedImage> => {
  const config = IMAGE_PRESETS[preset];
  return optimizeImage(uri, {
    maxWidth: config.width,
    quality: config.quality,
  });
};

/**
 * Generate multiple sizes of an image (for responsive loading)
 */
export const generateImageSet = async (
  uri: string
): Promise<Record<ImagePreset, OptimizedImage>> => {
  const presets: ImagePreset[] = ['thumbnail', 'card', 'detail', 'full'];
  const results: Partial<Record<ImagePreset, OptimizedImage>> = {};

  // Process in parallel for speed
  await Promise.all(
    presets.map(async (preset) => {
      results[preset] = await optimizeWithPreset(uri, preset);
    })
  );

  // Add original
  results.original = await optimizeWithPreset(uri, 'original');

  return results as Record<ImagePreset, OptimizedImage>;
};

/**
 * Batch optimize multiple images
 */
export const batchOptimize = async (
  uris: string[],
  preset: ImagePreset = 'detail',
  concurrency: number = 3
): Promise<OptimizedImage[]> => {
  const results: OptimizedImage[] = [];
  
  // Process in batches to avoid memory issues
  for (let i = 0; i < uris.length; i += concurrency) {
    const batch = uris.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((uri) => optimizeWithPreset(uri, preset))
    );
    results.push(...batchResults);
  }

  return results;
};

/**
 * Calculate optimal quality based on network conditions
 */
export const getAdaptiveQuality = (
  connectionType: 'wifi' | '4g' | '3g' | '2g' | 'unknown'
): number => {
  switch (connectionType) {
    case 'wifi':
      return 0.85;
    case '4g':
      return 0.75;
    case '3g':
      return 0.6;
    case '2g':
      return 0.4;
    default:
      return 0.7;
  }
};

/**
 * Get optimized image URL with size parameters (for CDN/Supabase transform)
 */
export const getOptimizedUrl = (
  originalUrl: string,
  width: number = 800,
  quality: number = 80
): string => {
  // For Supabase Storage with image transformation
  if (originalUrl.includes('supabase.co/storage')) {
    const url = new URL(originalUrl);
    url.searchParams.set('width', width.toString());
    url.searchParams.set('quality', quality.toString());
    return url.toString();
  }
  
  // For other CDNs, return original
  return originalUrl;
};

/**
 * Preload images for better UX
 */
export const preloadImages = async (urls: string[]): Promise<void> => {
  if (Platform.OS === 'web') {
    // Web: Use Image preloading
    await Promise.all(
      urls.map(
        (url) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = url;
          })
      )
    );
  } else {
    // Native: Use FileSystem to cache
    await Promise.all(
      urls.map(async (url) => {
        try {
          const filename = url.split('/').pop() || 'image';
          const cacheDir = `${getCacheDirectory()}images/`;
          const filePath = `${cacheDir}${filename}`;
          
          // Check if already cached
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          if (!fileInfo.exists) {
            // Ensure directory exists
            await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
            // Download to cache
            await FileSystem.downloadAsync(url, filePath);
          }
        } catch (error) {
          // Silently fail - preloading is not critical
        }
      })
    );
  }
};

/**
 * Clear image cache
 */
export const clearImageCache = async (): Promise<void> => {
  try {
    const cacheDir = `${getCacheDirectory()}images/`;
    await FileSystem.deleteAsync(cacheDir, { idempotent: true });
  } catch (error) {
    console.error('Failed to clear image cache:', error);
  }
};

/**
 * Get cache size
 */
export const getImageCacheSize = async (): Promise<number> => {
  try {
    const cacheDir = `${getCacheDirectory()}images/`;
    const dirInfo = await FileSystem.getInfoAsync(cacheDir);
    return (dirInfo as any).size || 0;
  } catch {
    return 0;
  }
};

export default {
  optimizeImage,
  optimizeWithPreset,
  generateImageSet,
  batchOptimize,
  getAdaptiveQuality,
  getOptimizedUrl,
  preloadImages,
  clearImageCache,
  getImageCacheSize,
  IMAGE_PRESETS,
};

