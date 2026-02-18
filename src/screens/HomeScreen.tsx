// Niumba - Home Screen (Zillow Style)
import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { CATEGORIES } from '../constants/data';
import ZillowPropertyCard from '../components/ZillowPropertyCard';
import QuickFilter from '../components/QuickFilter';
import { useFeaturedProperties } from '../hooks/useProperties';
import { useCityProperties } from '../hooks/useCityProperties';
import { ActivityIndicator } from 'react-native';
import { CITIES, getCitiesByProvince } from '../constants/cities';
import { getCityVisual } from '../constants/cityImages';
import { SkeletonCityCard, SkeletonPropertyCard } from '../components/SkeletonLoader';
import { analytics } from '../services/analyticsService';
// Utiliser Image directement pour éviter les problèmes d'import
// import OptimizedImage from '../components/OptimizedImage';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const scrollY = useRef(new Animated.Value(0)).current;

  const isEnglish = i18n.language === 'en';
  const { properties: featuredProperties, loading: featuredLoading } = useFeaturedProperties(6);
  const { citiesWithCounts, loading: citiesLoading } = useCityProperties();
  const [selectedProvince, setSelectedProvince] = useState<'all' | 'Haut-Katanga' | 'Lualaba'>('all');

  const handlePropertyPress = useCallback((propertyId: string) => {
    analytics.logPropertyView(propertyId);
    navigation.navigate('PropertyDetail', { propertyId });
  }, [navigation]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      analytics.logSearch(searchQuery.trim(), 0);
    }
    navigation.navigate('Explore', { query: searchQuery });
  }, [navigation, searchQuery]);

  const handleMapPress = useCallback(() => {
    navigation.navigate('Explore', { viewMode: 'map' });
  }, [navigation]);

  const handleSeeAllFeatured = useCallback(() => {
    navigation.navigate('Explore', {
      from: 'home',
      section: 'featured',
    });
  }, [navigation]);

  const handleSeeAllRecent = useCallback(() => {
    navigation.navigate('Explore', {
      from: 'home',
      section: 'recent',
    });
  }, [navigation]);

  const handleCityPress = useCallback((cityName: string) => {
    analytics.logEvent('search_performed', { city: cityName, source: 'home_city' });
    navigation.navigate('Explore', {
      filters: { city: cityName },
    });
  }, [navigation]);

  // Logger la vue d'écran
  useEffect(() => {
    analytics.logScreenView('HomeScreen');
  }, []);

  // Filtrer et trier les villes par province (memoized pour performance)
  const sortedCities = useMemo(() => {
    const filtered = selectedProvince === 'all' 
      ? citiesWithCounts 
      : citiesWithCounts.filter(city => city.province === selectedProvince);

    // Trier par nombre de propriétés (décroissant) puis par nom
    return [...filtered].sort((a, b) => {
      const countDiff = b.count - a.count;
      if (countDiff !== 0) return countDiff;
      return a.name.localeCompare(b.name);
    });
  }, [citiesWithCounts, selectedProvince]);

  const filters = useMemo(() => [
    { id: 'all', label: isEnglish ? 'All' : 'Tout', icon: 'apps' },
    { id: 'sale', label: isEnglish ? 'Buy' : 'Acheter', icon: 'home' },
    { id: 'rent', label: isEnglish ? 'Rent' : 'Louer', icon: 'key' },
    { id: 'land', label: isEnglish ? 'Land' : 'Terrain', icon: 'terrain' },
    { id: 'commercial', label: 'Commercial', icon: 'store' },
  ], [isEnglish]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Fixed Header Background */}
      <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]} />

      {/* Main Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <SafeAreaView edges={['top']}>
            <View style={styles.heroContent}>
              {/* Logo & Actions */}
              <View style={styles.logoRow}>
                <View style={styles.logoContainer}>
                  <View style={styles.logo}>
                    <Text style={styles.logoText}>N</Text>
                  </View>
                  <Text style={styles.brandName}>Niumba</Text>
                </View>
                <TouchableOpacity 
                  style={styles.notificationButton}
                  onPress={() => navigation.navigate('Notifications')}
                >
                  <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>3</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Title */}
              <Text style={styles.heroTitle}>
                {isEnglish ? 'Find your perfect' : 'Trouvez votre'}
              </Text>
              <Text style={styles.heroTitleBold}>
                {isEnglish ? 'home in Katanga' : 'maison au Katanga'}
              </Text>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <TouchableOpacity 
                  style={styles.searchBar}
                  onPress={() => navigation.navigate('Explore')}
                  activeOpacity={0.9}
                >
                  <Ionicons name="search" size={22} color={COLORS.textSecondary} />
                  <Text style={styles.searchPlaceholder}>
                    {isEnglish ? 'City, neighborhood, or address' : 'Ville, quartier ou adresse'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.mapButton} onPress={handleMapPress}>
                  <Ionicons name="map" size={22} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              {/* Quick Filters */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersContainer}
              >
                {filters.map((filter) => (
                  <QuickFilter
                    key={filter.id}
                    label={filter.label}
                    icon={filter.icon}
                    isActive={activeFilter === filter.id}
                    onPress={() => setActiveFilter(filter.id)}
                  />
                ))}
              </ScrollView>
            </View>
          </SafeAreaView>
        </View>

        {/* Featured Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                {isEnglish ? 'Featured homes' : 'Propriétés en vedette'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {isEnglish ? 'Handpicked for you' : 'Sélectionnées pour vous'}
              </Text>
            </View>
            <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAllFeatured}>
              <Text style={styles.seeAllText}>
                {isEnglish ? 'See all' : 'Voir tout'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={featuredProperties}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.propertiesList}
            renderItem={({ item }) => (
              <ZillowPropertyCard
                property={item}
                onPress={() => handlePropertyPress(item.id)}
                isEnglish={isEnglish}
              />
            )}
          />
        </View>

        {/* Recent Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                {isEnglish ? 'Just listed' : 'Nouvelles annonces'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                Lubumbashi & Kolwezi
              </Text>
            </View>
            <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAllRecent}>
              <Text style={styles.seeAllText}>
                {isEnglish ? 'See all' : 'Voir tout'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {featuredLoading ? (
            <View style={styles.skeletonContainer}>
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonPropertyCard key={i} />
              ))}
            </View>
          ) : featuredProperties.length > 0 ? (
            featuredProperties.slice(0, 4).map((property) => (
              <ZillowPropertyCard
                key={property.id}
                property={property}
                onPress={() => handlePropertyPress(property.id)}
                isEnglish={isEnglish}
                variant="horizontal"
              />
            ))
          ) : (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <Text style={{ color: COLORS.textSecondary }}>
                {isEnglish ? 'No featured properties available' : 'Aucune propriété en vedette'}
              </Text>
            </View>
          )}
        </View>

        {/* Explore by City */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {isEnglish ? 'Explore by city' : 'Explorer par ville'}
            </Text>
            {citiesLoading && (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 8 }} />
            )}
          </View>

          {/* Province Filter */}
          <View style={styles.provinceFilter}>
            <TouchableOpacity
              style={[styles.provinceButton, selectedProvince === 'all' && styles.provinceButtonActive]}
              onPress={() => setSelectedProvince('all')}
            >
              <Text style={[styles.provinceButtonText, selectedProvince === 'all' && styles.provinceButtonTextActive]}>
                {isEnglish ? 'All' : 'Toutes'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.provinceButton, selectedProvince === 'Haut-Katanga' && styles.provinceButtonActive]}
              onPress={() => setSelectedProvince('Haut-Katanga')}
            >
              <Text style={[styles.provinceButtonText, selectedProvince === 'Haut-Katanga' && styles.provinceButtonTextActive]}>
                Haut-Katanga
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.provinceButton, selectedProvince === 'Lualaba' && styles.provinceButtonActive]}
              onPress={() => setSelectedProvince('Lualaba')}
            >
              <Text style={[styles.provinceButtonText, selectedProvince === 'Lualaba' && styles.provinceButtonTextActive]}>
                Lualaba
              </Text>
            </TouchableOpacity>
          </View>
          
          {citiesLoading && sortedCities.length === 0 ? (
            // Skeleton loading - show placeholder cards while loading
            <View style={styles.citiesGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCityCard key={i} />
              ))}
            </View>
          ) : sortedCities.length > 0 ? (
            <View style={styles.citiesGrid}>
              {sortedCities.map((city) => {
                const visual = getCityVisual(city.name);
                return (
                  <TouchableOpacity
                    key={city.name}
                    style={styles.cityCard}
                    onPress={() => handleCityPress(city.name)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cityImageContainer}>
                      {/* Image with gradient overlay */}
                      <Image
                        source={{ uri: visual.imageUrl }}
                        style={styles.cityImage}
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={[`${visual.gradient[0]}00`, `${visual.gradient[1]}CC`]}
                        style={styles.cityImageOverlay}
                      >
                        {/* Icon */}
                        <View style={styles.cityIconContainer}>
                          <Ionicons 
                            name={visual.icon as any} 
                            size={28} 
                            color={COLORS.white} 
                          />
                        </View>
                        {/* Badge with count */}
                        {city.count > 0 && (
                          <View style={styles.cityBadge}>
                            <Text style={styles.cityBadgeText}>{city.count}</Text>
                          </View>
                        )}
                      </LinearGradient>
                    </View>
                    <View style={styles.cityInfo}>
                      <Text style={styles.cityName}>{city.name}</Text>
                      <View style={styles.cityMeta}>
                        <Ionicons name="location" size={12} color={COLORS.textLight} />
                        <Text style={styles.cityProvince}>{city.province}</Text>
                      </View>
                      {city.count > 0 && (
                        <Text style={styles.cityCount}>
                          {city.count} {isEnglish ? 'property' : 'bien'}{city.count !== 1 ? 's' : ''}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>
                {isEnglish ? 'No cities found' : 'Aucune ville trouvée'}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: COLORS.white,
    zIndex: 10,
    ...SHADOWS.small,
  },
  heroSection: {
    backgroundColor: COLORS.white,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...SHADOWS.medium,
  },
  heroContent: {
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.error,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  logo: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 10,
  },
  heroTitle: {
    fontSize: 28,
    color: COLORS.textSecondary,
    lineHeight: 34,
  },
  heroTitleBold: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
    lineHeight: 34,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusLarge,
    paddingHorizontal: 16,
    height: 52,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  mapButton: {
    width: 52,
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusLarge,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    paddingVertical: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: SIZES.screenPadding,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  propertiesList: {
    paddingRight: SIZES.screenPadding,
  },
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cityCard: {
    width: (width - SIZES.screenPadding * 2 - 12) / 2,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: 0,
    marginBottom: 12,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  cityImageContainer: {
    height: 120,
    width: '100%',
    borderRadius: SIZES.radiusLarge,
    overflow: 'hidden',
    position: 'relative',
  },
  cityImage: {
    width: '100%',
    height: '100%',
  },
  cityImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
  },
  cityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cityInfo: {
    padding: 12,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  cityCount: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  cityProvince: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  provinceFilter: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  provinceButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  provinceButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  provinceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  provinceButtonTextActive: {
    color: COLORS.white,
  },
  cityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  cityBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  loadingContainer: {
    padding: SIZES.padding * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonContainer: {
    paddingHorizontal: SIZES.screenPadding,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    padding: SIZES.padding * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  // Skeleton styles for progressive loading
  cityCardSkeleton: {
    width: (width - SIZES.screenPadding * 2 - 12) / 2,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: 0,
    marginBottom: 12,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  cityImageSkeleton: {
    height: 120,
    width: '100%',
    backgroundColor: COLORS.borderLight,
  },
  cityInfoSkeleton: {
    padding: 12,
  },
  cityNameSkeleton: {
    height: 16,
    width: '70%',
    backgroundColor: COLORS.borderLight,
    borderRadius: 4,
    marginBottom: 8,
  },
  cityMetaSkeleton: {
    height: 12,
    width: '50%',
    backgroundColor: COLORS.borderLight,
    borderRadius: 4,
  },
});

export default HomeScreen;
