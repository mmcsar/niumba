// Niumba - React Performance Utilities
// Optimized components and hooks for high-performance UI

import React, {
  memo,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
  ComponentType,
  FC,
} from 'react';
import {
  FlatList,
  FlatListProps,
  View,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  InteractionManager,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// OPTIMIZED FLATLIST
// ============================================

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  renderItem: (item: T, index: number) => React.ReactElement;
  itemHeight?: number;
  numColumns?: number;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  ListEmptyComponent?: React.ReactElement;
}

export function OptimizedFlatList<T extends { id: string | number }>({
  data,
  renderItem,
  itemHeight,
  numColumns = 1,
  onEndReached,
  onEndReachedThreshold = 0.5,
  isLoading = false,
  isLoadingMore = false,
  ListEmptyComponent,
  ...props
}: OptimizedFlatListProps<T>) {
  const flatListRef = useRef<FlatList<T>>(null);

  // Memoized key extractor
  const keyExtractor = useCallback((item: T) => String(item.id), []);

  // Memoized render item
  const memoizedRenderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => renderItem(item, index),
    [renderItem]
  );

  // Get item layout for fixed height items (major performance boost)
  const getItemLayout = useMemo(() => {
    if (!itemHeight) return undefined;

    return (_: T[] | null | undefined, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    });
  }, [itemHeight]);

  // Footer loading indicator
  const ListFooterComponent = useMemo(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }, [isLoadingMore]);

  // Empty state
  const EmptyComponent = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }
    return ListEmptyComponent || null;
  }, [isLoading, ListEmptyComponent]);

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      numColumns={numColumns}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={EmptyComponent}
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={21}
      initialNumToRender={10}
      // Disable scrolling during momentum for smoother animations
      scrollEventThrottle={16}
      {...props}
    />
  );
}

// ============================================
// LAZY COMPONENT LOADING
// ============================================

interface LazyComponentProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  delay?: number;
}

export const LazyComponent: FC<LazyComponentProps> = ({
  children,
  placeholder,
  delay = 0,
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      if (delay > 0) {
        setTimeout(() => setIsReady(true), delay);
      } else {
        setIsReady(true);
      }
    });

    return () => task.cancel();
  }, [delay]);

  if (!isReady) {
    return <>{placeholder || <View />}</>;
  }

  return <>{children}</>;
};

// ============================================
// SKELETON LOADER
// ============================================

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const [opacity] = useState(new Animated.Value(0.3));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: COLORS.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Import Animated
import { Animated } from 'react-native';

// ============================================
// PROPERTY CARD SKELETON
// ============================================

export const PropertyCardSkeleton: FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.cardSkeleton, style]}>
    <Skeleton width="100%" height={180} borderRadius={12} />
    <View style={styles.cardSkeletonContent}>
      <Skeleton width="60%" height={24} style={{ marginBottom: 8 }} />
      <Skeleton width="40%" height={18} style={{ marginBottom: 8 }} />
      <Skeleton width="80%" height={16} />
    </View>
  </View>
);

// ============================================
// VIRTUALIZED GRID
// ============================================

interface VirtualizedGridProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  numColumns: number;
  itemHeight: number;
  spacing?: number;
  onEndReached?: () => void;
  isLoading?: boolean;
  isLoadingMore?: boolean;
}

export function VirtualizedGrid<T extends { id: string | number }>({
  data,
  renderItem,
  numColumns,
  itemHeight,
  spacing = 8,
  onEndReached,
  isLoading,
  isLoadingMore,
}: VirtualizedGridProps<T>) {
  const itemWidth = (SCREEN_WIDTH - spacing * (numColumns + 1)) / numColumns;

  const getItemLayout = useCallback(
    (_: T[] | null | undefined, index: number) => {
      const row = Math.floor(index / numColumns);
      return {
        length: itemHeight + spacing,
        offset: (itemHeight + spacing) * row,
        index,
      };
    },
    [itemHeight, spacing, numColumns]
  );

  const renderGridItem = useCallback(
    ({ item, index }: { item: T; index: number }) => (
      <View
        style={{
          width: itemWidth,
          marginLeft: spacing,
          marginTop: spacing,
        }}
      >
        {renderItem(item, index)}
      </View>
    ),
    [itemWidth, spacing, renderItem]
  );

  return (
    <OptimizedFlatList
      data={data}
      renderItem={(item, index) => renderGridItem({ item, index })}
      numColumns={numColumns}
      itemHeight={itemHeight + spacing}
      onEndReached={onEndReached}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      contentContainerStyle={{ paddingBottom: spacing }}
    />
  );
}

// ============================================
// DEBOUNCED CALLBACK HOOK
// ============================================

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  // Update callback ref on change
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );
}

// ============================================
// THROTTLED CALLBACK HOOK
// ============================================

export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callbackRef.current(...args);
      }
    }) as T,
    [delay]
  );
}

// ============================================
// PREVIOUS VALUE HOOK
// ============================================

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// ============================================
// MOUNTED CHECK HOOK
// ============================================

export function useIsMounted(): () => boolean {
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
}

// ============================================
// STABLE CALLBACK HOOK
// ============================================

export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
    []
  );
}

// ============================================
// MEMOIZE HOC
// ============================================

export function withMemo<P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
): FC<P> {
  const MemoizedComponent = memo(Component, propsAreEqual);
  MemoizedComponent.displayName = `Memo(${Component.displayName || Component.name || 'Component'})`;
  return MemoizedComponent;
}

// ============================================
// DEEP COMPARE MEMO
// ============================================

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}

export function useDeepMemo<T>(value: T): T {
  const ref = useRef<T>(value);

  if (!deepEqual(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  cardSkeleton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardSkeletonContent: {
    padding: 12,
  },
});

export default {
  OptimizedFlatList,
  LazyComponent,
  Skeleton,
  PropertyCardSkeleton,
  VirtualizedGrid,
  useDebouncedCallback,
  useThrottledCallback,
  usePrevious,
  useIsMounted,
  useStableCallback,
  withMemo,
  useDeepMemo,
};

