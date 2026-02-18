// Niumba - Search/Explore Screen (Zillow Style)
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { CATEGORIES } from '../constants/data';
import ZillowPropertyCard from '../components/ZillowPropertyCard';
import { Property, PropertyType } from '../types';
import { useProperties } from '../hooks/useProperties';
import { ActivityIndicator, RefreshControl } from 'react-native';
import SearchSuggestions from '../components/SearchSuggestions';
import {
  saveSearchToHistory,
  getSearchHistory,
  removeSearchFromHistory,
  clearSearchHistory,
  getSearchSuggestions,
  AdvancedSearchFilters,
  SearchSuggestion,
} from '../services/advancedSearchService';
import { analytics } from '../services/analyticsService';

interface SearchScreenProps {
  navigation: any;
  route?: {
    params?: {
      viewMode?: 'list' | 'map';
      query?: string;
    };
  };
}

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(route?.params?.query || '');
  const [viewMode, setViewMode] = useState<'list' | 'map'>(route?.params?.viewMode || 'list');
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [sortBy, setSortBy] = useState<'price' | 'created_at' | 'views' | 'area' | 'bedrooms'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showSortModal, setShowSortModal] = useState(false);
  
  // Filters
  const [priceType, setPriceType] = useState<'all' | 'sale' | 'rent'>('all');
  const [selectedType, setSelectedType] = useState<PropertyType | null>(null);
  const [bedsMin, setBedsMin] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });

  const isEnglish = i18n.language === 'en';

  // Use Supabase properties with filters
  const { 
    properties: allProperties, 
    loading, 
    error, 
    refresh,
    hasMore = false,
    loadMore 
  } = useProperties({
    filters: {
      search: searchQuery || undefined,
      priceType: priceType !== 'all' ? priceType : undefined,
      type: selectedType || undefined,
      bedrooms: bedsMin || undefined,
      minPrice: priceRange.min || undefined,
      maxPrice: priceRange.max || undefined,
      status: 'active',
    },
    pageSize: 100, // Récupérer plus pour le tri côté client
  });

  // Appliquer le tri
  const filteredProperties = useMemo(() => {
    const sorted = [...allProperties];
    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'created_at':
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        case 'views':
          aValue = a.views || 0;
          bValue = b.views || 0;
          break;
        case 'area':
          aValue = a.area || 0;
          bValue = b.area || 0;
          break;
        case 'bedrooms':
          aValue = a.bedrooms || 0;
          bValue = b.bedrooms || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    return sorted;
  }, [allProperties, sortBy, sortOrder]);

  // Charger les suggestions quand la query change
  useEffect(() => {
    const loadSuggestions = async () => {
      if (searchQuery.length > 0) {
        const suggs = await getSearchSuggestions(searchQuery, allProperties);
        setSuggestions(suggs);
        setShowSuggestions(true);
      } else {
        // Afficher l'historique si pas de query
        const history = await getSearchHistory();
        const historySuggestions: SearchSuggestion[] = history.slice(0, 5).map(item => ({
          type: 'query',
          value: item.query || item.filters.search || '',
          label: item.query || item.filters.search || '',
          count: item.resultsCount,
        }));
        setSuggestions(historySuggestions);
        setShowSuggestions(historySuggestions.length > 0);
      }
    };

    const timeoutId = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, allProperties]);

  // Logger la recherche
  useEffect(() => {
    if (searchQuery && filteredProperties.length > 0) {
      analytics.logSearch(searchQuery, filteredProperties.length, {
        priceType,
        type: selectedType || undefined,
        bedrooms: bedsMin || undefined,
      });
    }
  }, [searchQuery, filteredProperties.length, priceType, selectedType, bedsMin]);

  const handlePropertyPress = (propertyId: string) => {
    analytics.logPropertyView(propertyId);
    navigation.navigate('PropertyDetail', { propertyId });
  };

  const handleSearch = async () => {
    setShowSuggestions(false);
    // Sauvegarder dans l'historique
    if (searchQuery || priceType !== 'all' || selectedType || bedsMin || priceRange.min || priceRange.max) {
      const filters: AdvancedSearchFilters = {
        search: searchQuery || undefined,
        priceType: priceType !== 'all' ? priceType : undefined,
        type: selectedType || undefined,
        bedrooms: bedsMin || undefined,
        minPrice: priceRange.min || undefined,
        maxPrice: priceRange.max || undefined,
        sortBy,
        sortOrder,
      };
      await saveSearchToHistory(searchQuery, filters, filteredProperties.length);
    }
  };

  const handleSuggestionSelect = async (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'query') {
      setSearchQuery(suggestion.value);
    } else if (suggestion.type === 'city') {
      // Navigation vers la recherche avec filtre ville
      navigation.navigate('Explore', { filters: { city: suggestion.value } });
    }
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceType('all');
    setSelectedType(null);
    setBedsMin(null);
    setPriceRange({ min: null, max: null });
    setSortBy('created_at');
    setSortOrder('desc');
    refresh();
  };

  const handleClearHistory = async () => {
    await clearSearchHistory();
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const activeFiltersCount = [
    priceType !== 'all',
    selectedType !== null,
    bedsMin !== null,
  ].filter(Boolean).length;

  const renderProperty = ({ item }: { item: Property }) => (
    <View style={styles.propertyItem}>
      <ZillowPropertyCard
        property={item}
        onPress={() => handlePropertyPress(item.id)}
        isEnglish={isEnglish}
        variant="horizontal"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        {/* Search Bar */}
        <View style={styles.searchRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={isEnglish ? 'Search location...' : 'Rechercher un lieu...'}
              placeholderTextColor={COLORS.textLight}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onFocus={() => {
                if (searchQuery.length === 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                // Délai pour permettre le clic sur les suggestions
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              onSubmitEditing={handleSearch}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
        >
          {/* Price Type */}
          <TouchableOpacity 
            style={[styles.chip, priceType !== 'all' && styles.chipActive]}
            onPress={() => setPriceType(priceType === 'sale' ? 'rent' : priceType === 'rent' ? 'all' : 'sale')}
          >
            <Text style={[styles.chipText, priceType !== 'all' && styles.chipTextActive]}>
              {priceType === 'all' 
                ? (isEnglish ? 'Buy/Rent' : 'Achat/Location')
                : priceType === 'sale' 
                  ? (isEnglish ? 'For Sale' : 'À Vendre')
                  : (isEnglish ? 'For Rent' : 'À Louer')}
            </Text>
            <Ionicons 
              name="chevron-down" 
              size={16} 
              color={priceType !== 'all' ? COLORS.white : COLORS.textSecondary} 
            />
          </TouchableOpacity>

          {/* Beds */}
          <TouchableOpacity 
            style={[styles.chip, bedsMin !== null && styles.chipActive]}
            onPress={() => setBedsMin(bedsMin === null ? 1 : bedsMin === 5 ? null : bedsMin + 1)}
          >
            <Text style={[styles.chipText, bedsMin !== null && styles.chipTextActive]}>
              {bedsMin !== null ? `${bedsMin}+ ${isEnglish ? 'beds' : 'ch.'}` : (isEnglish ? 'Beds' : 'Chambres')}
            </Text>
            <Ionicons 
              name="chevron-down" 
              size={16} 
              color={bedsMin !== null ? COLORS.white : COLORS.textSecondary} 
            />
          </TouchableOpacity>

          {/* More Filters */}
          <TouchableOpacity 
            style={[styles.chip, activeFiltersCount > 0 && styles.chipActive]}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons 
              name="options" 
              size={18} 
              color={activeFiltersCount > 0 ? COLORS.white : COLORS.textSecondary} 
            />
            <Text style={[styles.chipText, activeFiltersCount > 0 && styles.chipTextActive]}>
              {isEnglish ? 'Filters' : 'Filtres'}
              {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Results & View Toggle */}
        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>
            {filteredProperties.length} {isEnglish ? 'results' : 'résultats'}
          </Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={styles.sortButton}
              onPress={() => setShowSortModal(true)}
            >
              <Ionicons name="swap-vertical" size={18} color={COLORS.textSecondary} />
              <Text style={styles.sortButtonText}>
                {isEnglish ? 'Sort' : 'Trier'}
              </Text>
            </TouchableOpacity>
            <View style={styles.viewToggle}>
              <TouchableOpacity 
                style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
                onPress={() => setViewMode('list')}
              >
                <Ionicons 
                  name="list" 
                  size={18} 
                  color={viewMode === 'list' ? COLORS.white : COLORS.textSecondary} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.viewButton, viewMode === 'map' && styles.viewButtonActive]}
                onPress={() => setViewMode('map')}
              >
                <Ionicons 
                  name="map" 
                  size={18} 
                  color={viewMode === 'map' ? COLORS.white : COLORS.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <SearchSuggestions
          suggestions={suggestions}
          onSelect={handleSuggestionSelect}
          onClearHistory={handleClearHistory}
          showHistory={searchQuery.length === 0}
          isEnglish={isEnglish}
        />
      )}

      {/* Content */}
      {viewMode === 'list' ? (
        loading && filteredProperties.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.emptySubtitle, { marginTop: 16 }]}>
              {isEnglish ? 'Loading properties...' : 'Chargement des propriétés...'}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
            <Text style={styles.emptyTitle}>
              {isEnglish ? 'Error loading properties' : 'Erreur de chargement'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {error}
            </Text>
            <TouchableOpacity style={styles.clearButton} onPress={refresh}>
              <Text style={styles.clearButtonText}>
                {isEnglish ? 'Retry' : 'Réessayer'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : filteredProperties.length > 0 ? (
          <FlatList
            data={filteredProperties}
            keyExtractor={(item) => item.id}
            renderItem={renderProperty}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={10}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refresh}
                tintColor={COLORS.primary}
              />
            }
            onEndReached={() => {
              if (hasMore && !loading && loadMore) {
                loadMore();
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loading && filteredProperties.length > 0 ? (
                <View style={{ paddingVertical: 20 }}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              ) : null
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>
              {isEnglish ? 'No results found' : 'Aucun résultat'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {isEnglish ? 'Try adjusting your search or filters' : 'Essayez de modifier vos critères'}
            </Text>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>
                {isEnglish ? 'Clear all filters' : 'Effacer les filtres'}
              </Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={64} color={COLORS.textLight} />
          <Text style={styles.mapPlaceholderText}>
            {isEnglish ? 'Map view coming soon' : 'Vue carte bientôt disponible'}
          </Text>
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEnglish ? 'Filters' : 'Filtres'}
            </Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Property Type */}
            <Text style={styles.filterLabel}>
              {isEnglish ? 'Property Type' : 'Type de bien'}
            </Text>
            <View style={styles.typeGrid}>
              {CATEGORIES.slice(0, 6).map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.typeButton,
                    selectedType === category.id && styles.typeButtonActive,
                  ]}
                  onPress={() => setSelectedType(
                    selectedType === category.id ? null : category.id as PropertyType
                  )}
                >
                  <Text style={[
                    styles.typeButtonText,
                    selectedType === category.id && styles.typeButtonTextActive,
                  ]}>
                    {isEnglish ? category.nameEn : category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.resetButton} onPress={clearFilters}>
              <Text style={styles.resetButtonText}>
                {isEnglish ? 'Reset' : 'Réinitialiser'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>
                {isEnglish ? 'Show results' : 'Voir les résultats'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sortModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEnglish ? 'Sort by' : 'Trier par'}
              </Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sortOptions}>
              {[
                { value: 'created_at', label: isEnglish ? 'Newest First' : 'Plus récent' },
                { value: 'price', label: isEnglish ? 'Price' : 'Prix' },
                { value: 'views', label: isEnglish ? 'Most Viewed' : 'Plus vues' },
                { value: 'area', label: isEnglish ? 'Area' : 'Superficie' },
                { value: 'bedrooms', label: isEnglish ? 'Bedrooms' : 'Chambres' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.sortOption}
                  onPress={() => {
                    setSortBy(option.value as any);
                    setShowSortModal(false);
                  }}
                >
                  <Text style={[
                    styles.sortOptionText,
                    sortBy === option.value && styles.sortOptionTextActive,
                  ]}>
                    {option.label}
                  </Text>
                  {sortBy === option.value && (
                    <Ionicons
                      name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                      size={20}
                      color={COLORS.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}

              <View style={styles.sortOrderSection}>
                <Text style={styles.sortOrderLabel}>
                  {isEnglish ? 'Order' : 'Ordre'}
                </Text>
                <View style={styles.sortOrderButtons}>
                  <TouchableOpacity
                    style={[
                      styles.sortOrderButton,
                      sortOrder === 'asc' && styles.sortOrderButtonActive,
                    ]}
                    onPress={() => setSortOrder('asc')}
                  >
                    <Text style={[
                      styles.sortOrderButtonText,
                      sortOrder === 'asc' && styles.sortOrderButtonTextActive,
                    ]}>
                      {isEnglish ? 'Ascending' : 'Croissant'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sortOrderButton,
                      sortOrder === 'desc' && styles.sortOrderButtonActive,
                    ]}
                    onPress={() => setSortOrder('desc')}
                  >
                    <Text style={[
                      styles.sortOrderButtonText,
                      sortOrder === 'desc' && styles.sortOrderButtonTextActive,
                    ]}>
                      {isEnglish ? 'Descending' : 'Décroissant'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingBottom: 12,
    ...SHADOWS.small,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  filterChips: {
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: SIZES.radiusFull,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: 8,
  },
  resultsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 4,
  },
  viewButton: {
    width: 36,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  viewButtonActive: {
    backgroundColor: COLORS.primary,
  },
  list: {
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: 16,
    paddingBottom: 100,
  },
  propertyItem: {
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.screenPadding,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  clearButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
  },
  clearButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
    marginBottom: 10,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  typeButtonTextActive: {
    color: COLORS.white,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  resetButton: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 12,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  applyButton: {
    flex: 2,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    gap: 6,
  },
  sortButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sortModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  sortOptions: {
    paddingHorizontal: SIZES.screenPadding,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  sortOptionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  sortOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  sortOrderSection: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    marginTop: 8,
  },
  sortOrderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  sortOrderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sortOrderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortOrderButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortOrderButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  sortOrderButtonTextActive: {
    color: COLORS.white,
  },
});

export default SearchScreen;
