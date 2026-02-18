// Niumba - Map View Screen
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Property } from '../types';
import { useProperties } from '../hooks/useProperties';
import { ActivityIndicator } from 'react-native';

const { width, height } = Dimensions.get('window');

// Note: For real implementation, use react-native-maps
// This is a placeholder UI when maps aren't available

interface MapScreenProps {
  navigation: any;
  route?: {
    params?: {
      initialRegion?: {
        latitude: number;
        longitude: number;
      };
    };
  };
}

const MapScreen: React.FC<MapScreenProps> = ({ navigation, route }) => {
  const { i18n } = useTranslation();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const isEnglish = i18n.language === 'en';

  // Fetch properties with coordinates from Supabase
  const { properties: allProperties, loading, error, refresh } = useProperties({
    filters: {
      status: 'active',
    },
    pageSize: 100, // Get more properties for map view
  });

  // Filter properties that have coordinates
  const properties = allProperties.filter(p => p.latitude && p.longitude && p.latitude !== 0 && p.longitude !== 0);

  const handlePropertyPress = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleViewDetails = () => {
    if (selectedProperty) {
      navigation.navigate('PropertyDetail', { propertyId: selectedProperty.id });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEnglish ? 'Map View' : 'Vue Carte'}
        </Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={80} color={COLORS.primary} />
          <Text style={styles.mapPlaceholderTitle}>
            {isEnglish ? 'Interactive Map' : 'Carte Interactive'}
          </Text>
          <Text style={styles.mapPlaceholderText}>
            {isEnglish 
              ? 'Install react-native-maps to enable the interactive map with property markers.'
              : 'Installez react-native-maps pour activer la carte interactive avec les marqueurs de propriétés.'}
          </Text>
          
          {/* Property markers as list */}
          <View style={styles.propertyList}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>
                  {isEnglish ? 'Loading properties...' : 'Chargement des propriétés...'}
                </Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={32} color={COLORS.error} />
                <Text style={styles.errorText}>
                  {isEnglish ? 'Error loading properties' : 'Erreur de chargement'}
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={refresh}>
                  <Text style={styles.retryButtonText}>
                    {isEnglish ? 'Retry' : 'Réessayer'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : properties.length > 0 ? (
              <>
                <Text style={styles.listTitle}>
                  {properties.length} {isEnglish ? 'properties in this area' : 'propriétés dans cette zone'}
                </Text>
                {properties.slice(0, 4).map((property) => (
                  <TouchableOpacity
                    key={property.id}
                    style={[
                      styles.propertyMarker,
                      selectedProperty?.id === property.id && styles.propertyMarkerSelected
                    ]}
                    onPress={() => handlePropertyPress(property)}
                  >
                    <View style={styles.markerIcon}>
                      <Ionicons name="location" size={16} color={COLORS.white} />
                    </View>
                    <View style={styles.markerInfo}>
                      <Text style={styles.markerTitle} numberOfLines={1}>
                        {isEnglish ? property.titleEn : property.title}
                      </Text>
                      <Text style={styles.markerPrice}>
                        ${property.price.toLocaleString()}
                        {property.priceType === 'rent' ? '/mo' : ''}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="location-outline" size={48} color={COLORS.textLight} />
                <Text style={styles.emptyText}>
                  {isEnglish ? 'No properties with location data' : 'Aucune propriété avec données de localisation'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Selected Property Card */}
      {selectedProperty && (
        <View style={styles.propertyCard}>
          {selectedProperty.images && selectedProperty.images.length > 0 ? (
            <Image
              source={{ uri: selectedProperty.images[0] }}
              style={styles.cardImage}
            />
          ) : (
            <View style={[styles.cardImage, { backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="home-outline" size={32} color={COLORS.textSecondary} />
            </View>
          )}
          <View style={styles.cardContent}>
            <Text style={styles.cardPrice}>
              ${selectedProperty.price.toLocaleString()}
              {selectedProperty.priceType === 'rent' ? '/mo' : ''}
            </Text>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {isEnglish ? selectedProperty.titleEn : selectedProperty.title}
            </Text>
            <Text style={styles.cardAddress} numberOfLines={1}>
              {selectedProperty.address}, {selectedProperty.city}
            </Text>
            <View style={styles.cardStats}>
              <Text style={styles.cardStat}>
                {selectedProperty.bedrooms} {isEnglish ? 'bd' : 'ch'}
              </Text>
              <Text style={styles.cardStatDivider}>•</Text>
              <Text style={styles.cardStat}>
                {selectedProperty.bathrooms} {isEnglish ? 'ba' : 'sdb'}
              </Text>
              <Text style={styles.cardStatDivider}>•</Text>
              <Text style={styles.cardStat}>
                {selectedProperty.area} m²
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.cardButton}
            onPress={handleViewDetails}
          >
            <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton}>
          <Ionicons name="add" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton}>
          <Ionicons name="remove" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton}>
          <Ionicons name="locate" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  mapContainer: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.screenPadding,
    backgroundColor: COLORS.primaryLight,
  },
  mapPlaceholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  propertyList: {
    width: '100%',
    marginTop: 24,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  propertyMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: SIZES.radius,
    marginBottom: 8,
    ...SHADOWS.small,
  },
  propertyMarkerSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  markerIcon: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  markerTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  markerPrice: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  propertyCard: {
    position: 'absolute',
    bottom: 100,
    left: SIZES.screenPadding,
    right: SIZES.screenPadding,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  cardImage: {
    width: 100,
    height: 100,
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  cardAddress: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  cardStat: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cardStatDivider: {
    fontSize: 12,
    color: COLORS.textLight,
    marginHorizontal: 6,
  },
  cardButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
  },
  zoomControls: {
    position: 'absolute',
    right: SIZES.screenPadding,
    top: 80,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  zoomButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default MapScreen;

