// Niumba - Property Card Component
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Property } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
  isEnglish: boolean;
  horizontal?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onPress,
  isEnglish,
  horizontal = false,
}) => {
  const title = isEnglish ? property.titleEn : property.title;

  const formatPrice = () => {
    const formattedPrice = property.price.toLocaleString();
    if (property.priceType === 'rent') {
      const period = isEnglish
        ? property.rentPeriod === 'month' ? '/mo' : '/yr'
        : property.rentPeriod === 'month' ? '/mois' : '/an';
      return `$${formattedPrice}${period}`;
    }
    return `$${formattedPrice}`;
  };

  if (horizontal) {
    return (
      <TouchableOpacity
        style={styles.horizontalContainer}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Image source={{ uri: property.images[0] }} style={styles.horizontalImage} />
        <View style={styles.horizontalContent}>
          <View style={styles.horizontalBadge}>
            <Text style={styles.horizontalBadgeText}>
              {property.priceType === 'sale'
                ? isEnglish ? 'For Sale' : 'À vendre'
                : isEnglish ? 'For Rent' : 'À louer'}
            </Text>
          </View>
          <Text style={styles.horizontalTitle} numberOfLines={1}>{title}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={COLORS.secondary} />
            <Text style={styles.horizontalLocation} numberOfLines={1}>
              {property.address}, {property.city}
            </Text>
          </View>
          <View style={styles.horizontalStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="bed-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{property.bedrooms}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="shower" size={16} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{property.bathrooms}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="ruler-square" size={16} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{property.area}m²</Text>
            </View>
          </View>
          <Text style={styles.horizontalPrice}>{formatPrice()}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: property.images[0] }} style={styles.image} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        />
        <TouchableOpacity style={styles.heartButton}>
          <Ionicons name="heart-outline" size={20} color={COLORS.white} />
        </TouchableOpacity>
        {property.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>
              {isEnglish ? 'Featured' : 'En vedette'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.propertyType}>
          {property.type.toUpperCase()}
        </Text>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color={COLORS.secondary} />
          <Text style={styles.location} numberOfLines={1}>
            {property.address}, {property.city}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="bed-outline" size={16} color={COLORS.primary} />
            <Text style={styles.statText}>{property.bedrooms} {isEnglish ? 'Beds' : 'Ch.'}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="shower" size={16} color={COLORS.primary} />
            <Text style={styles.statText}>{property.bathrooms} {isEnglish ? 'Baths' : 'SdB'}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="garage" size={16} color={COLORS.primary} />
            <Text style={styles.statText}>{property.garage}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>{formatPrice()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    marginRight: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
  },
  content: {
    padding: 14,
  },
  propertyType: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.secondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  location: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  // Horizontal card styles
  horizontalContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  horizontalImage: {
    width: 120,
    height: 140,
  },
  horizontalContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  horizontalBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: SIZES.radiusFull,
    marginBottom: 4,
  },
  horizontalBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  horizontalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  horizontalLocation: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  horizontalStats: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  horizontalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
});

export default PropertyCard;

