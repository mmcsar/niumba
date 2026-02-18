// Niumba - Virtual Tour Preview Component
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');

interface VirtualTourPreviewProps {
  thumbnailUrl: string;
  roomCount: number;
  onPress: () => void;
}

const VirtualTourPreview: React.FC<VirtualTourPreviewProps> = ({
  thumbnailUrl,
  roomCount,
  onPress,
}) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
      
      {/* Overlay */}
      <View style={styles.overlay}>
        {/* 360 Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.icon360}>
            <Text style={styles.icon360Text}>360°</Text>
          </View>
          <Ionicons name="play-circle" size={60} color={COLORS.white} />
        </View>

        {/* Label */}
        <View style={styles.labelContainer}>
          <Ionicons name="videocam" size={18} color={COLORS.white} />
          <Text style={styles.labelText}>
            {isEnglish ? 'Virtual Tour' : 'Visite Virtuelle'}
          </Text>
          <View style={styles.roomBadge}>
            <Text style={styles.roomBadgeText}>
              {roomCount} {isEnglish ? 'rooms' : 'pièces'}
            </Text>
          </View>
        </View>
      </View>

      {/* Animated hint */}
      <View style={styles.hintContainer}>
        <View style={styles.hintArrow}>
          <Ionicons name="chevron-forward" size={16} color={COLORS.white} />
        </View>
        <View style={[styles.hintArrow, { opacity: 0.6 }]}>
          <Ionicons name="chevron-forward" size={16} color={COLORS.white} />
        </View>
        <View style={[styles.hintArrow, { opacity: 0.3 }]}>
          <Ionicons name="chevron-forward" size={16} color={COLORS.white} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - SIZES.screenPadding * 2,
    height: 200,
    borderRadius: SIZES.radiusLarge,
    overflow: 'hidden',
    marginVertical: 16,
    ...SHADOWS.medium,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon360: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  icon360Text: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
  },
  labelText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  roomBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roomBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
  },
  hintContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    flexDirection: 'row',
  },
  hintArrow: {
    marginLeft: -8,
  },
});

export default VirtualTourPreview;

