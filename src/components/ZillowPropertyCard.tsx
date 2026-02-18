// Niumba - Zillow Style Property Card
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Property } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

interface ZillowPropertyCardProps {
  property: Property;
  onPress: () => void;
  isEnglish: boolean;
  variant?: 'default' | 'horizontal';
}

const ZillowPropertyCard: React.FC<ZillowPropertyCardProps> = ({
  property,
  onPress,
  isEnglish,
  variant = 'default',
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const title = isEnglish ? property.titleEn : property.title;

  const formatPrice = () => {
    const price = property.price.toLocaleString('en-US');
    if (property.priceType === 'rent') {
      return `$${price}/${isEnglish ? 'mo' : 'mois'}`;
    }
    return `$${price}`;
  };

  const toggleSave = () => {
    setIsSaved(!isSaved);
  };

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        style={styles.horizontalCard}
        onPress={onPress}
        activeOpacity={0.95}
      >
        {/* Image */}
        <View style={styles.horizontalImageContainer}>
          {property.images && property.images.length > 0 ? (
            <Image 
              source={{ uri: property.images[0] }} 
              style={styles.horizontalImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.horizontalImage, { backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="home-outline" size={40} color={COLORS.textSecondary} />
            </View>
          )}
          {/* Save Button */}
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={toggleSave}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={isSaved ? 'heart' : 'heart-outline'} 
              size={22} 
              color={isSaved ? COLORS.heart : COLORS.white} 
            />
          </TouchableOpacity>
          {/* Badge */}
          {property.isFeatured && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {isEnglish ? 'Featured' : 'En vedette'}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.horizontalContent}>
          {/* Price */}
          <Text style={styles.price}>{formatPrice()}</Text>
          
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{property.bedrooms}</Text>
              <Text style={styles.statLabel}>{isEnglish ? 'bd' : 'ch'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{property.bathrooms}</Text>
              <Text style={styles.statLabel}>{isEnglish ? 'ba' : 'sdb'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{property.area.toLocaleString()}</Text>
              <Text style={styles.statLabel}>m²</Text>
            </View>
          </View>

          {/* Address */}
          <Text style={styles.address} numberOfLines={1}>
            {property.address}
          </Text>
          <Text style={styles.city} numberOfLines={1}>
            {property.city}, {property.province}
          </Text>

          {/* Type Badge */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>
              {property.priceType === 'sale' 
                ? (isEnglish ? 'For Sale' : 'À Vendre')
                : (isEnglish ? 'For Rent' : 'À Louer')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        {property.images && property.images.length > 0 ? (
          <Image 
            source={{ uri: property.images[0] }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, { backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="home-outline" size={40} color={COLORS.textSecondary} />
          </View>
        )}
        
        {/* Gradient Overlay */}
        <View style={styles.imageOverlay} />

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={toggleSave}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={isSaved ? 'heart' : 'heart-outline'} 
            size={24} 
            color={isSaved ? COLORS.heart : COLORS.white} 
          />
        </TouchableOpacity>

        {/* Image Count */}
        {property.images && property.images.length > 0 && (
          <View style={styles.imageCount}>
            <Ionicons name="images" size={14} color={COLORS.white} />
            <Text style={styles.imageCountText}>{property.images.length}</Text>
          </View>
        )}

        {/* Badge */}
        {property.isFeatured && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {isEnglish ? 'Featured' : 'En vedette'}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Price */}
        <Text style={styles.price}>{formatPrice()}</Text>
        
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{property.bedrooms}</Text>
            <Text style={styles.statLabel}>{isEnglish ? 'beds' : 'ch'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{property.bathrooms}</Text>
            <Text style={styles.statLabel}>{isEnglish ? 'baths' : 'sdb'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{property.area.toLocaleString()}</Text>
            <Text style={styles.statLabel}>m²</Text>
          </View>
        </View>

        {/* Address */}
        <Text style={styles.address} numberOfLines={1}>
          {property.address}
        </Text>
        <Text style={styles.city} numberOfLines={1}>
          {property.city}, {property.province}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Default Card
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    marginRight: 16,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  saveButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCount: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCountText: {
    fontSize: 12,
    color: COLORS.white,
    marginLeft: 4,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    padding: 14,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 3,
  },
  statDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textLight,
    marginHorizontal: 10,
  },
  address: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  city: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Horizontal Card
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    marginBottom: 12,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  horizontalImageContainer: {
    position: 'relative',
    width: 140,
    height: 140,
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
  },
  horizontalContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
});

export default ZillowPropertyCard;

