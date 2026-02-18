// Niumba - Nearby Property Item Component
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Property } from '../types';

interface NearbyItemProps {
  property: Property;
  onPress: () => void;
  isEnglish: boolean;
}

const NearbyItem: React.FC<NearbyItemProps> = ({ property, onPress, isEnglish }) => {
  const title = isEnglish ? property.titleEn : property.title;

  // Mock distance calculation (in real app, would use actual location)
  const distance = (Math.random() * 5 + 0.5).toFixed(1);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: property.images[0] }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.distance}>{distance} km</Text>
        </View>
        
        <View style={styles.locationRow}>
          <Ionicons name="location" size={12} color={COLORS.secondary} />
          <Text style={styles.location} numberOfLines={1}>
            {property.address}, {property.city}
          </Text>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="bed-outline" size={14} color={COLORS.primary} />
            <Text style={styles.statText}>{property.bedrooms} {isEnglish ? 'Beds' : 'Ch.'}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="shower" size={14} color={COLORS.primary} />
            <Text style={styles.statText}>{property.bathrooms} {isEnglish ? 'Baths' : 'SdB'}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="garage" size={14} color={COLORS.primary} />
            <Text style={styles.statText}>{property.garage}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.screenPadding,
    marginBottom: 12,
    padding: 12,
    ...SHADOWS.small,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radiusSmall,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  distance: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
});

export default NearbyItem;

