// Niumba - Skeleton Loader Component
// Reusable skeleton loading component for better UX

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: COLORS.borderLight || '#E5E5E5',
          opacity,
        },
        style,
      ]}
    />
  );
};

// Pre-built skeleton components
export const SkeletonPropertyCard: React.FC = () => (
  <View style={styles.propertyCard}>
    <SkeletonLoader width="100%" height={200} borderRadius={8} />
    <View style={styles.propertyCardContent}>
      <SkeletonLoader width="60%" height={20} style={styles.marginBottom} />
      <SkeletonLoader width="40%" height={16} style={styles.marginBottom} />
      <SkeletonLoader width="80%" height={14} />
    </View>
  </View>
);

export const SkeletonCityCard: React.FC = () => (
  <View style={styles.cityCard}>
    <SkeletonLoader width="100%" height={120} borderRadius={8} />
    <View style={styles.cityCardContent}>
      <SkeletonLoader width="70%" height={18} style={styles.marginBottom} />
      <SkeletonLoader width="50%" height={14} />
    </View>
  </View>
);

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <View>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonLoader
        key={i}
        width="100%"
        height={60}
        borderRadius={8}
        style={styles.listItem}
      />
    ))}
  </View>
);

export const SkeletonText: React.FC<{ lines?: number; width?: number | string }> = ({
  lines = 1,
  width = '100%',
}) => (
  <View>
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonLoader
        key={i}
        width={i === lines - 1 ? width : '100%'}
        height={16}
        borderRadius={4}
        style={styles.textLine}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  propertyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    ...COLORS.shadows?.card || {},
  },
  propertyCardContent: {
    padding: 12,
  },
  cityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cityCardContent: {
    padding: 12,
  },
  listItem: {
    marginBottom: 12,
  },
  textLine: {
    marginBottom: 8,
  },
  marginBottom: {
    marginBottom: 8,
  },
});

export default SkeletonLoader;

