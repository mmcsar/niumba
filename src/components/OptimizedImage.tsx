// Niumba - Optimized Image Component
// Lazy loading et cache pour améliorer les performances
import React, { useState } from 'react';
import { Image, View, StyleSheet, ActivityIndicator, ImageStyle, ViewStyle } from 'react-native';
import { COLORS } from '../constants/theme';

interface OptimizedImageProps {
  source: { uri: string } | number;
  style?: ImageStyle | ViewStyle;
  placeholder?: React.ReactNode;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: () => void;
  priority?: 'low' | 'normal' | 'high';
  cache?: 'default' | 'reload' | 'force-cache' | 'only-if-cached';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  placeholder,
  resizeMode = 'cover',
  onLoadStart,
  onLoadEnd,
  onError,
  priority = 'normal',
  cache = 'default',
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setLoading(false);
    onLoadEnd?.();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    onError?.();
  };

  // Default placeholder
  const defaultPlaceholder = (
    <View style={[styles.placeholder, style]}>
      <ActivityIndicator size="small" color={COLORS.primary} />
    </View>
  );

  // Error placeholder
  const errorPlaceholder = (
    <View style={[styles.placeholder, style, styles.errorPlaceholder]}>
      <View style={styles.errorIcon}>
        {/* Placeholder icon */}
      </View>
    </View>
  );

  if (error) {
    return errorPlaceholder;
  }

  return (
    <View style={style}>
      {loading && (placeholder || defaultPlaceholder)}
      <Image
        source={source}
        style={[style, loading && styles.hidden]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorPlaceholder: {
    backgroundColor: COLORS.background,
  },
  errorIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.textLight,
    borderRadius: 20,
  },
  hidden: {
    opacity: 0,
  },
});

export default OptimizedImage;
export { OptimizedImage };

