// Niumba - Advanced Search Screen (Sans Slider externe)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { PropertyType } from '../types/database';
import { getSavedSearches, saveSearch, deleteSearch, updateLastUsed, SavedSearch } from '../services/savedSearchService';

interface AdvancedSearchScreenProps {
  navigation: any;
  route?: {
    params?: {
      initialFilters?: SearchFilters;
    };
  };
}

interface SearchFilters {
  query: string;
  priceType: 'all' | 'sale' | 'rent';
  priceMin: number;
  priceMax: number;
  propertyTypes: PropertyType[];
  bedroomsMin: number;
  bathroomsMin: number;
  areaMin: number;
  areaMax: number;
  cities: string[];
  features: string[];
}

const PROPERTY_TYPES: { value: PropertyType; labelFr: string; labelEn: string; icon: string }[] = [
  { value: 'house', labelFr: 'Maison', labelEn: 'House', icon: 'home' },
  { value: 'apartment', labelFr: 'Appartement', labelEn: 'Apartment', icon: 'business' },
  { value: 'flat', labelFr: 'Studio', labelEn: 'Flat', icon: 'bed' },
  { value: 'townhouse', labelFr: 'Duplex', labelEn: 'Townhouse', icon: 'layers' },
  { value: 'land', labelFr: 'Terrain', labelEn: 'Land', icon: 'map' },
  { value: 'commercial', labelFr: 'Commercial', labelEn: 'Commercial', icon: 'storefront' },
  { value: 'warehouse', labelFr: 'Entrepôt', labelEn: 'Warehouse', icon: 'cube' },
];

import { CITIES } from '../constants/cities';

const FEATURES = [
  { value: 'pool', labelFr: 'Piscine', labelEn: 'Pool' },
  { value: 'garden', labelFr: 'Jardin', labelEn: 'Garden' },
  { value: 'security', labelFr: 'Sécurité 24h', labelEn: '24h Security' },
  { value: 'generator', labelFr: 'Groupe électrogène', labelEn: 'Generator' },
  { value: 'borehole', labelFr: 'Forage', labelEn: 'Borehole' },
  { value: 'parking', labelFr: 'Parking', labelEn: 'Parking' },
  { value: 'furnished', labelFr: 'Meublé', labelEn: 'Furnished' },
  { value: 'aircon', labelFr: 'Climatisation', labelEn: 'Air Conditioning' },
];

const PRICE_RANGES = [
  { min: 0, max: 50000, label: '< $50K' },
  { min: 50000, max: 100000, label: '$50K - $100K' },
  { min: 100000, max: 250000, label: '$100K - $250K' },
  { min: 250000, max: 500000, label: '$250K - $500K' },
  { min: 500000, max: 1000000, label: '$500K - $1M' },
  { min: 1000000, max: 10000000, label: '> $1M' },
];

const AdvancedSearchScreen: React.FC<AdvancedSearchScreenProps> = ({ navigation, route }) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    priceType: 'all',
    priceMin: 0,
    priceMax: 10000000,
    propertyTypes: [],
    bedroomsMin: 0,
    bathroomsMin: 0,
    areaMin: 0,
    areaMax: 2000,
    cities: [],
    features: [],
    ...route?.params?.initialFilters,
  });

  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [showSavedSearches, setShowSavedSearches] = useState(false);

  const togglePropertyType = (type: PropertyType) => {
    setFilters(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type],
    }));
  };

  const toggleCity = (city: string) => {
    setFilters(prev => ({
      ...prev,
      cities: prev.cities.includes(city)
        ? prev.cities.filter(c => c !== city)
        : [...prev.cities, city],
    }));
  };

  const toggleFeature = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const selectPriceRange = (index: number) => {
    if (selectedPriceRange === index) {
      setSelectedPriceRange(null);
      setFilters(prev => ({ ...prev, priceMin: 0, priceMax: 10000000 }));
    } else {
      setSelectedPriceRange(index);
      const range = PRICE_RANGES[index];
      setFilters(prev => ({ ...prev, priceMin: range.min, priceMax: range.max }));
    }
  };

  const resetFilters = () => {
    setFilters({
      query: '',
      priceType: 'all',
      priceMin: 0,
      priceMax: 10000000,
      propertyTypes: [],
      bedroomsMin: 0,
      bathroomsMin: 0,
      areaMin: 0,
      areaMax: 2000,
      cities: [],
      features: [],
    });
    setSelectedPriceRange(null);
  };

  const applyFilters = () => {
    navigation.navigate('Explore', { filters });
  };

  // Load saved searches on mount
  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = async () => {
    const searches = await getSavedSearches();
    setSavedSearches(searches);
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim()) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Please enter a name for this search' : 'Veuillez entrer un nom pour cette recherche'
      );
      return;
    }

    const success = await saveSearch(searchName.trim(), filters);
    if (success) {
      Alert.alert(
        isEnglish ? 'Success' : 'Succès',
        isEnglish ? 'Search saved successfully' : 'Recherche sauvegardée avec succès'
      );
      setShowSaveModal(false);
      setSearchName('');
      loadSavedSearches();
    } else {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Failed to save search' : 'Échec de la sauvegarde'
      );
    }
  };

  const handleLoadSearch = async (savedSearch: SavedSearch) => {
    setFilters({
      ...savedSearch.filters,
      propertyTypes: savedSearch.filters.propertyTypes as PropertyType[],
    });
    setShowSavedSearches(false);
    await updateLastUsed(savedSearch.id);
    loadSavedSearches();
  };

  const handleDeleteSearch = async (id: string) => {
    Alert.alert(
      isEnglish ? 'Delete Search' : 'Supprimer la recherche',
      isEnglish ? 'Are you sure you want to delete this saved search?' : 'Êtes-vous sûr de vouloir supprimer cette recherche sauvegardée ?',
      [
        { text: isEnglish ? 'Cancel' : 'Annuler', style: 'cancel' },
        {
          text: isEnglish ? 'Delete' : 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteSearch(id);
            loadSavedSearches();
          },
        },
      ]
    );
  };

  const activeFiltersCount = [
    filters.priceType !== 'all',
    selectedPriceRange !== null,
    filters.propertyTypes.length > 0,
    filters.bedroomsMin > 0,
    filters.bathroomsMin > 0,
    filters.cities.length > 0,
    filters.features.length > 0,
  ].filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEnglish ? 'Advanced Search' : 'Recherche avancée'}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowSavedSearches(true)}
            style={styles.headerIconButton}
          >
            <Ionicons name="bookmark" size={24} color={COLORS.primary} />
            {savedSearches.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{savedSearches.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={resetFilters}>
            <Text style={styles.resetText}>
              {isEnglish ? 'Reset' : 'Réinitialiser'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Query */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={isEnglish ? 'Search location, address...' : 'Rechercher lieu, adresse...'}
            placeholderTextColor={COLORS.textLight}
            value={filters.query}
            onChangeText={(text) => setFilters(prev => ({ ...prev, query: text }))}
          />
        </View>

        {/* Price Type */}
        <Text style={styles.sectionTitle}>
          {isEnglish ? 'Listing Type' : 'Type d\'annonce'}
        </Text>
        <View style={styles.priceTypeRow}>
          {[
            { value: 'all', label: isEnglish ? 'All' : 'Tous' },
            { value: 'sale', label: isEnglish ? 'Buy' : 'Acheter' },
            { value: 'rent', label: isEnglish ? 'Rent' : 'Louer' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.priceTypeButton,
                filters.priceType === option.value && styles.priceTypeButtonActive,
              ]}
              onPress={() => setFilters(prev => ({ ...prev, priceType: option.value as any }))}
            >
              <Text style={[
                styles.priceTypeText,
                filters.priceType === option.value && styles.priceTypeTextActive,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Range */}
        <Text style={styles.sectionTitle}>
          {isEnglish ? 'Price Range' : 'Fourchette de prix'}
        </Text>
        <View style={styles.priceRangeGrid}>
          {PRICE_RANGES.map((range, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.priceRangeButton,
                selectedPriceRange === index && styles.priceRangeButtonActive,
              ]}
              onPress={() => selectPriceRange(index)}
            >
              <Text style={[
                styles.priceRangeText,
                selectedPriceRange === index && styles.priceRangeTextActive,
              ]}>
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Property Type */}
        <Text style={styles.sectionTitle}>
          {isEnglish ? 'Property Type' : 'Type de bien'}
        </Text>
        <View style={styles.typeGrid}>
          {PROPERTY_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeCard,
                filters.propertyTypes.includes(type.value) && styles.typeCardActive,
              ]}
              onPress={() => togglePropertyType(type.value)}
            >
              <Ionicons
                name={type.icon as any}
                size={24}
                color={filters.propertyTypes.includes(type.value) ? COLORS.white : COLORS.primary}
              />
              <Text style={[
                styles.typeCardText,
                filters.propertyTypes.includes(type.value) && styles.typeCardTextActive,
              ]}>
                {isEnglish ? type.labelEn : type.labelFr}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bedrooms */}
        <Text style={styles.sectionTitle}>
          {isEnglish ? 'Bedrooms' : 'Chambres'}
        </Text>
        <View style={styles.roomButtons}>
          {[0, 1, 2, 3, 4, 5].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.roomButton,
                filters.bedroomsMin === num && styles.roomButtonActive,
              ]}
              onPress={() => setFilters(prev => ({ ...prev, bedroomsMin: num }))}
            >
              <Text style={[
                styles.roomButtonText,
                filters.bedroomsMin === num && styles.roomButtonTextActive,
              ]}>
                {num === 0 ? (isEnglish ? 'Any' : 'Tous') : `${num}+`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bathrooms */}
        <Text style={styles.sectionTitle}>
          {isEnglish ? 'Bathrooms' : 'Salles de bain'}
        </Text>
        <View style={styles.roomButtons}>
          {[0, 1, 2, 3, 4].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.roomButton,
                filters.bathroomsMin === num && styles.roomButtonActive,
              ]}
              onPress={() => setFilters(prev => ({ ...prev, bathroomsMin: num }))}
            >
              <Text style={[
                styles.roomButtonText,
                filters.bathroomsMin === num && styles.roomButtonTextActive,
              ]}>
                {num === 0 ? (isEnglish ? 'Any' : 'Tous') : `${num}+`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cities */}
        <Text style={styles.sectionTitle}>
          {isEnglish ? 'Cities' : 'Villes'}
        </Text>
        <View style={styles.citiesGrid}>
          {CITIES.map((city) => (
            <TouchableOpacity
              key={city.name}
              style={[
                styles.cityChip,
                filters.cities.includes(city.name) && styles.cityChipActive,
              ]}
              onPress={() => toggleCity(city.name)}
            >
              <Text style={[
                styles.cityChipText,
                filters.cities.includes(city.name) && styles.cityChipTextActive,
              ]}>
                {city.name}
              </Text>
              <Text style={[
                styles.cityChipProvince,
                filters.cities.includes(city.name) && styles.cityChipProvinceActive,
              ]}>
                {city.province}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Features */}
        <Text style={styles.sectionTitle}>
          {isEnglish ? 'Features & Amenities' : 'Caractéristiques'}
        </Text>
        <View style={styles.featuresGrid}>
          {FEATURES.map((feature) => (
            <TouchableOpacity
              key={feature.value}
              style={[
                styles.featureChip,
                filters.features.includes(feature.value) && styles.featureChipActive,
              ]}
              onPress={() => toggleFeature(feature.value)}
            >
              {filters.features.includes(feature.value) && (
                <Ionicons name="checkmark" size={16} color={COLORS.white} style={{ marginRight: 4 }} />
              )}
              <Text style={[
                styles.featureChipText,
                filters.features.includes(feature.value) && styles.featureChipTextActive,
              ]}>
                {isEnglish ? feature.labelEn : feature.labelFr}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, styles.saveButtonSecondary]}
          onPress={() => setShowSaveModal(true)}
        >
          <Ionicons name="bookmark-outline" size={20} color={COLORS.primary} />
          <Text style={styles.saveButtonText}>
            {isEnglish ? 'Save Search' : 'Sauvegarder'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>
            {isEnglish ? 'Show Results' : 'Voir les résultats'}
            {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Save Search Modal */}
      <Modal
        visible={showSaveModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEnglish ? 'Save Search' : 'Sauvegarder la recherche'}
              </Text>
              <TouchableOpacity onPress={() => setShowSaveModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder={isEnglish ? 'Enter search name...' : 'Entrez un nom pour cette recherche...'}
              placeholderTextColor={COLORS.textLight}
              value={searchName}
              onChangeText={setSearchName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowSaveModal(false);
                  setSearchName('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>
                  {isEnglish ? 'Cancel' : 'Annuler'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSaveSearch}
              >
                <Text style={styles.modalButtonTextSave}>
                  {isEnglish ? 'Save' : 'Sauvegarder'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Saved Searches Modal */}
      <Modal
        visible={showSavedSearches}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSavedSearches(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEnglish ? 'Saved Searches' : 'Recherches sauvegardées'}
              </Text>
              <TouchableOpacity onPress={() => setShowSavedSearches(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.savedSearchesList}>
              {savedSearches.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="bookmark-outline" size={48} color={COLORS.textLight} />
                  <Text style={styles.emptyStateText}>
                    {isEnglish ? 'No saved searches' : 'Aucune recherche sauvegardée'}
                  </Text>
                </View>
              ) : (
                savedSearches.map((search) => (
                  <View key={search.id} style={styles.savedSearchItem}>
                    <TouchableOpacity
                      style={styles.savedSearchContent}
                      onPress={() => handleLoadSearch(search)}
                    >
                      <Ionicons name="bookmark" size={20} color={COLORS.primary} />
                      <View style={styles.savedSearchInfo}>
                        <Text style={styles.savedSearchName}>{search.name}</Text>
                        <Text style={styles.savedSearchDate}>
                          {new Date(search.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteSearch(search.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
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
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  resetText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.screenPadding,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    paddingHorizontal: 14,
    height: 50,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 24,
    marginBottom: 12,
  },
  priceTypeRow: {
    flexDirection: 'row',
  },
  priceTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceTypeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  priceTypeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  priceTypeTextActive: {
    color: COLORS.white,
  },
  priceRangeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  priceRangeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.background,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceRangeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  priceRangeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  priceRangeTextActive: {
    color: COLORS.white,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  typeCard: {
    width: '30%',
    marginHorizontal: '1.5%',
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeCardText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  typeCardTextActive: {
    color: COLORS.white,
  },
  roomButtons: {
    flexDirection: 'row',
  },
  roomButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roomButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roomButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  roomButtonTextActive: {
    color: COLORS.white,
    fontWeight: '500',
  },
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cityChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.background,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cityChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  cityChipText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  cityChipTextActive: {
    color: COLORS.white,
  },
  cityChipProvince: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  cityChipProvinceActive: {
    color: 'rgba(255,255,255,0.7)',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  featureChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  featureChipTextActive: {
    color: COLORS.white,
  },
  footer: {
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: SIZES.radius,
    gap: 8,
    marginBottom: 12,
  },
  saveButtonSecondary: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  saveButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalInput: {
    marginHorizontal: SIZES.screenPadding,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: SIZES.screenPadding,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalButtonSave: {
    backgroundColor: COLORS.primary,
  },
  modalButtonTextCancel: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  modalButtonTextSave: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  savedSearchesList: {
    maxHeight: 400,
    paddingHorizontal: SIZES.screenPadding,
    marginTop: 16,
  },
  savedSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  savedSearchContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  savedSearchInfo: {
    flex: 1,
  },
  savedSearchName: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  savedSearchDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
});

export default AdvancedSearchScreen;
