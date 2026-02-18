// Niumba - Nearby Search (GPS) Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useNearbyProperties } from '../hooks/useProperties';
import { Property } from '../types';

interface NearbySearchScreenProps {
  navigation: any;
}

const NearbySearchScreen: React.FC<NearbySearchScreenProps> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [radius, setRadius] = useState(5); // km
  
  // Use Supabase hook for nearby properties
  const { 
    properties: nearbyPropertiesData, 
    loading: propertiesLoading, 
    error: propertiesError,
    refresh 
  } = useNearbyProperties(
    location?.coords.latitude || null,
    location?.coords.longitude || null,
    radius // radius in km
  );

  // Calculate distances and add to properties
  const nearbyProperties = React.useMemo(() => {
    if (!location || !nearbyPropertiesData || nearbyPropertiesData.length === 0) {
      return [];
    }

    const userLat = location.coords.latitude;
    const userLon = location.coords.longitude;

    return nearbyPropertiesData
      .filter(property => property.latitude && property.longitude)
      .map(property => {
        const distance = calculateDistance(
          userLat, 
          userLon, 
          property.latitude!, 
          property.longitude!
        );
        return { ...property, distance };
      })
      .filter(p => p.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }, [location, nearbyPropertiesData, radius]);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (location) {
      refresh();
    }
  }, [location, radius, refresh]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setPermissionDenied(true);
        setLocationLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setLocation(currentLocation);
      setLocationLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationLoading(false);
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Could not get your location' : 'Impossible d\'obtenir votre position'
      );
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDistance = (km: number) => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  };

  const RadiusButton: React.FC<{ value: number }> = ({ value }) => (
    <TouchableOpacity
      style={[styles.radiusButton, radius === value && styles.radiusButtonActive]}
      onPress={() => setRadius(value)}
    >
      <Text style={[styles.radiusButtonText, radius === value && styles.radiusButtonTextActive]}>
        {value} km
      </Text>
    </TouchableOpacity>
  );

  const renderProperty = ({ item }: { item: Property & { distance: number } }) => {
    const hasImage = item.images && item.images.length > 0;
    
    return (
      <TouchableOpacity
        style={styles.propertyCard}
        onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
      >
        {hasImage ? (
          <Image source={{ uri: item.images[0] }} style={styles.propertyImage} />
        ) : (
          <View style={[styles.propertyImage, styles.propertyImagePlaceholder]}>
            <Ionicons name="home-outline" size={32} color={COLORS.textLight} />
          </View>
        )}
        <View style={styles.distanceBadge}>
          <Ionicons name="location" size={12} color={COLORS.white} />
          <Text style={styles.distanceText}>{formatDistance(item.distance)}</Text>
        </View>
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyPrice}>{formatPrice(item.price)}</Text>
        <Text style={styles.propertyTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.propertyDetails}>
          {item.bedrooms && (
            <View style={styles.detailItem}>
              <Ionicons name="bed-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{item.bedrooms}</Text>
            </View>
          )}
          {item.bathrooms && (
            <View style={styles.detailItem}>
              <Ionicons name="water-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{item.bathrooms}</Text>
            </View>
          )}
          {item.area && (
            <View style={styles.detailItem}>
              <Ionicons name="resize-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{item.area} m²</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  if (locationLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {isEnglish ? 'Getting your location...' : 'Recherche de votre position...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (permissionDenied) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>{isEnglish ? 'Nearby' : 'À proximité'}</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.centerContent}>
          <Ionicons name="location-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.permissionTitle}>
            {isEnglish ? 'Location Permission Required' : 'Permission de localisation requise'}
          </Text>
          <Text style={styles.permissionText}>
            {isEnglish 
              ? 'We need access to your location to find properties near you.'
              : 'Nous avons besoin de votre position pour trouver des propriétés près de vous.'}
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={() => Linking.openSettings()}
          >
            <Text style={styles.permissionButtonText}>
              {isEnglish ? 'Open Settings' : 'Ouvrir les paramètres'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEnglish ? 'Nearby Properties' : 'Propriétés à proximité'}</Text>
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={() => navigation.navigate('Map', { 
            initialRegion: location ? {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            } : undefined
          })}
        >
          <Ionicons name="map-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Radius Selector */}
      <View style={styles.radiusContainer}>
        <Text style={styles.radiusLabel}>
          {isEnglish ? 'Search radius:' : 'Rayon de recherche:'}
        </Text>
        <View style={styles.radiusButtons}>
          <RadiusButton value={1} />
          <RadiusButton value={5} />
          <RadiusButton value={10} />
          <RadiusButton value={25} />
        </View>
      </View>

      {/* Location Info */}
      {location && (
        <View style={styles.locationInfo}>
          <Ionicons name="navigate" size={16} color={COLORS.success} />
          <Text style={styles.locationText}>
            {isEnglish ? 'Your location' : 'Votre position'}: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
          </Text>
          <TouchableOpacity onPress={requestLocationPermission}>
            <Ionicons name="refresh" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Results */}
      {propertiesLoading && location ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {isEnglish ? 'Searching for properties...' : 'Recherche de propriétés...'}
          </Text>
        </View>
      ) : propertiesError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>
            {isEnglish ? 'Error loading properties' : 'Erreur lors du chargement des propriétés'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>
              {isEnglish ? 'Retry' : 'Réessayer'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {nearbyProperties.length} {isEnglish ? 'properties found' : 'propriétés trouvées'}
            </Text>
          </View>

          <FlatList
            data={nearbyProperties}
            renderItem={renderProperty}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="home-outline" size={48} color={COLORS.textLight} />
                <Text style={styles.emptyTitle}>
                  {isEnglish ? 'No properties nearby' : 'Aucune propriété à proximité'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {isEnglish 
                    ? 'Try increasing the search radius'
                    : 'Essayez d\'augmenter le rayon de recherche'}
                </Text>
              </View>
            }
          />
        </>
      )}
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
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  mapButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 20,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  radiusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  radiusLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 12,
  },
  radiusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.background,
  },
  radiusButtonActive: {
    backgroundColor: COLORS.primary,
  },
  radiusButtonText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  radiusButtonTextActive: {
    color: COLORS.white,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 10,
    backgroundColor: COLORS.success + '15',
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  resultsHeader: {
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  list: {
    paddingHorizontal: SIZES.screenPadding,
    paddingBottom: 100,
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    marginBottom: 12,
    ...SHADOWS.card,
  },
  propertyImage: {
    width: 120,
    height: 100,
  },
  distanceBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
  propertyInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  propertyTitle: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  propertyDetails: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  propertyImagePlaceholder: {
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NearbySearchScreen;

