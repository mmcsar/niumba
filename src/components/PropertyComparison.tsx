// Niumba - Property Comparison Component
// Permet de comparer plusieurs propriétés côte à côte
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Property } from '../types';
import { Image } from 'react-native';

interface PropertyComparisonProps {
  properties: Property[];
  onRemove?: (propertyId: string) => void;
  onPropertyPress?: (propertyId: string) => void;
  isEnglish?: boolean;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SIZES.screenPadding * 2 - 20) / 2; // 2 colonnes avec espacement

const PropertyComparison: React.FC<PropertyComparisonProps> = ({
  properties,
  onRemove,
  onPropertyPress,
  isEnglish = false,
}) => {
  if (properties.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="git-compare-outline" size={48} color={COLORS.textLight} />
        <Text style={styles.emptyText}>
          {isEnglish ? 'Select properties to compare' : 'Sélectionnez des propriétés à comparer'}
        </Text>
      </View>
    );
  }

  const comparisonFields = [
    { key: 'price', label: isEnglish ? 'Price' : 'Prix', format: (p: Property) => `$${p.price.toLocaleString()}` },
    { key: 'type', label: isEnglish ? 'Type' : 'Type', format: (p: Property) => p.type },
    { key: 'bedrooms', label: isEnglish ? 'Bedrooms' : 'Chambres', format: (p: Property) => `${p.bedrooms}` },
    { key: 'bathrooms', label: isEnglish ? 'Bathrooms' : 'Salles de bain', format: (p: Property) => `${p.bathrooms}` },
    { key: 'area', label: isEnglish ? 'Area' : 'Superficie', format: (p: Property) => `${p.area}m²` },
    { key: 'city', label: isEnglish ? 'City' : 'Ville', format: (p: Property) => p.city },
  ];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {properties.map((property, index) => (
        <View key={property.id} style={[styles.card, index === 0 && styles.firstCard]}>
          {/* Header avec image */}
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => onPropertyPress?.(property.id)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: property.images[0] }}
              style={styles.image}
              resizeMode="cover"
            />
            {onRemove && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemove(property.id)}
              >
                <Ionicons name="close-circle" size={24} color={COLORS.white} />
              </TouchableOpacity>
            )}
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>
                ${property.price.toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Title */}
          <TouchableOpacity
            onPress={() => onPropertyPress?.(property.id)}
            style={styles.titleContainer}
          >
            <Text style={styles.title} numberOfLines={2}>
              {isEnglish ? property.titleEn || property.title : property.title}
            </Text>
            <Text style={styles.address} numberOfLines={1}>
              {property.address}, {property.city}
            </Text>
          </TouchableOpacity>

          {/* Comparison Fields */}
          <View style={styles.fieldsContainer}>
            {comparisonFields.map((field) => (
              <View key={field.key} style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <Text style={styles.fieldValue}>
                  {field.format(property)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 16,
  },
  emptyContainer: {
    padding: SIZES.screenPadding * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginRight: 12,
    ...SHADOWS.card,
  },
  firstCard: {
    marginLeft: 0,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: SIZES.radius,
    borderTopRightRadius: SIZES.radius,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  priceBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radius,
  },
  priceText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  titleContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  fieldsContainer: {
    padding: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  fieldLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
});

export default PropertyComparison;

