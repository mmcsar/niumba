// Niumba - Compare Properties Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Property } from '../types';
import { useProperty } from '../hooks/useProperties';
import { useProperties } from '../hooks/useProperties';
import { ActivityIndicator } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SIZES.screenPadding * 2 - 12) / 2;

interface ComparePropertiesScreenProps {
  navigation: any;
  route?: {
    params?: {
      propertyIds?: string[];
    };
  };
}

const ComparePropertiesScreen: React.FC<ComparePropertiesScreenProps> = ({ navigation, route }) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  
  const initialIds = route?.params?.propertyIds || [];
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [selectorSlot, setSelectorSlot] = useState<number>(0);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Fetch available properties for selector
  const { properties: availableProperties, loading: loadingAvailable } = useProperties({
    filters: {
      status: 'active',
    },
    pageSize: 50,
  });

  // Fetch initial properties by IDs
  const property1 = useProperty(initialIds[0] || null);
  const property2 = useProperty(initialIds[1] || null);
  const property3 = useProperty(initialIds[2] || null);

  // Update selected properties when initial properties are loaded
  useEffect(() => {
    const loadedProperties: Property[] = [];
    if (property1.property) loadedProperties.push(property1.property);
    if (property2.property) loadedProperties.push(property2.property);
    if (property3.property) loadedProperties.push(property3.property);
    
    if (loadedProperties.length > 0) {
      setSelectedProperties(loadedProperties);
      setLoadingInitial(false);
    } else if (!property1.loading && !property2.loading && !property3.loading) {
      setLoadingInitial(false);
    }
  }, [property1.property, property2.property, property3.property, property1.loading, property2.loading, property3.loading]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const ComparisonRow: React.FC<{
    label: string;
    values: (string | number | undefined)[];
    highlight?: boolean;
    isBest?: number;
  }> = ({ label, values, highlight, isBest }) => (
    <View style={[styles.comparisonRow, highlight && styles.comparisonRowHighlight]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowValues}>
        {values.map((value, index) => (
          <View key={index} style={styles.rowValueContainer}>
            <Text style={[
              styles.rowValue,
              isBest === index && styles.rowValueBest,
            ]}>
              {value || '-'}
            </Text>
            {isBest === index && (
              <Ionicons name="trophy" size={12} color={COLORS.warning} style={{ marginLeft: 4 }} />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const PropertyCard: React.FC<{ property: Property; index: number }> = ({ property, index }) => (
    <View style={styles.propertyCard}>
      {property.images && property.images.length > 0 ? (
        <Image source={{ uri: property.images[0] }} style={styles.propertyImage} />
      ) : (
        <View style={[styles.propertyImage, { backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="home-outline" size={32} color={COLORS.textSecondary} />
        </View>
      )}
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => {
          setSelectedProperties(prev => prev.filter((_, i) => i !== index));
        }}
      >
        <Ionicons name="close-circle" size={24} color={COLORS.error} />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.changeButton}
        onPress={() => {
          setSelectorSlot(index);
          setShowSelector(true);
        }}
      >
        <Ionicons name="swap-horizontal" size={16} color={COLORS.white} />
      </TouchableOpacity>
      <Text style={styles.propertyTitle} numberOfLines={2}>{property.title}</Text>
      <Text style={styles.propertyPrice}>{formatPrice(property.price)}</Text>
    </View>
  );

  const AddPropertyCard: React.FC<{ index: number }> = ({ index }) => (
    <TouchableOpacity 
      style={styles.addPropertyCard}
      onPress={() => {
        setSelectorSlot(index);
        setShowSelector(true);
      }}
    >
      <Ionicons name="add-circle-outline" size={40} color={COLORS.primary} />
      <Text style={styles.addPropertyText}>
        {isEnglish ? 'Add Property' : 'Ajouter'}
      </Text>
    </TouchableOpacity>
  );

  // Find best values for comparison
  const getBestIndex = (values: number[], type: 'min' | 'max') => {
    if (values.length === 0) return undefined;
    const validValues = values.map((v, i) => ({ value: v, index: i })).filter(v => v.value > 0);
    if (validValues.length === 0) return undefined;
    if (type === 'min') {
      return validValues.reduce((a, b) => a.value < b.value ? a : b).index;
    }
    return validValues.reduce((a, b) => a.value > b.value ? a : b).index;
  };

  const prices = selectedProperties.map(p => p.price);
  const areas = selectedProperties.map(p => p.area || 0);
  const pricePerSqm = selectedProperties.map(p => p.area ? p.price / p.area : 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEnglish ? 'Compare Properties' : 'Comparer'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Property Cards */}
        {loadingInitial ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>
              {isEnglish ? 'Loading properties...' : 'Chargement des propriétés...'}
            </Text>
          </View>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContainer}
          >
            {selectedProperties.map((property, index) => (
              <PropertyCard key={property.id} property={property} index={index} />
            ))}
            {selectedProperties.length < 3 && (
              <AddPropertyCard index={selectedProperties.length} />
            )}
          </ScrollView>
        )}

        {/* Comparison Table */}
        {selectedProperties.length >= 2 && (
          <View style={styles.comparisonTable}>
            <Text style={styles.sectionTitle}>
              {isEnglish ? 'Comparison' : 'Comparaison'}
            </Text>

            <ComparisonRow
              label={isEnglish ? 'Price' : 'Prix'}
              values={selectedProperties.map(p => formatPrice(p.price))}
              highlight
              isBest={getBestIndex(prices, 'min')}
            />
            
            <ComparisonRow
              label={isEnglish ? 'Area' : 'Surface'}
              values={selectedProperties.map(p => p.area ? `${p.area} m²` : '-')}
              isBest={getBestIndex(areas, 'max')}
            />
            
            <ComparisonRow
              label={isEnglish ? 'Price/m²' : 'Prix/m²'}
              values={selectedProperties.map(p => p.area ? `$${Math.round(p.price / p.area)}` : '-')}
              highlight
              isBest={getBestIndex(pricePerSqm, 'min')}
            />
            
            <ComparisonRow
              label={isEnglish ? 'Bedrooms' : 'Chambres'}
              values={selectedProperties.map(p => p.bedrooms?.toString())}
              isBest={getBestIndex(selectedProperties.map(p => p.bedrooms || 0), 'max')}
            />
            
            <ComparisonRow
              label={isEnglish ? 'Bathrooms' : 'Salles de bain'}
              values={selectedProperties.map(p => p.bathrooms?.toString())}
            />
            
            <ComparisonRow
              label={isEnglish ? 'Type' : 'Type'}
              values={selectedProperties.map(p => p.type)}
              highlight
            />
            
            <ComparisonRow
              label={isEnglish ? 'City' : 'Ville'}
              values={selectedProperties.map(p => p.city)}
            />
            
            <ComparisonRow
              label={isEnglish ? 'Year Built' : 'Année'}
              values={selectedProperties.map(p => p.yearBuilt?.toString())}
              highlight
            />
          </View>
        )}

        {/* Features Comparison */}
        {selectedProperties.length >= 2 && (
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>
              {isEnglish ? 'Features' : 'Caractéristiques'}
            </Text>
            
            {['parking', 'garden', 'pool', 'security', 'furnished'].map(feature => (
              <View key={feature} style={styles.featureRow}>
                <Text style={styles.featureLabel}>
                  {feature === 'parking' ? (isEnglish ? 'Parking' : 'Parking') :
                   feature === 'garden' ? (isEnglish ? 'Garden' : 'Jardin') :
                   feature === 'pool' ? (isEnglish ? 'Pool' : 'Piscine') :
                   feature === 'security' ? (isEnglish ? 'Security' : 'Sécurité') :
                   (isEnglish ? 'Furnished' : 'Meublé')}
                </Text>
                <View style={styles.featureValues}>
                  {selectedProperties.map((p, index) => {
                    const hasFeature = p.features?.includes(feature);
                    return (
                      <View key={index} style={styles.featureValue}>
                        <Ionicons 
                          name={hasFeature ? 'checkmark-circle' : 'close-circle'} 
                          size={22} 
                          color={hasFeature ? COLORS.success : COLORS.error} 
                        />
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {selectedProperties.length < 2 && (
          <View style={styles.emptyState}>
            <Ionicons name="git-compare-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>
              {isEnglish ? 'Select at least 2 properties' : 'Sélectionnez au moins 2 propriétés'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {isEnglish 
                ? 'Add properties to compare their features side by side'
                : 'Ajoutez des propriétés pour comparer leurs caractéristiques'}
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Property Selector Modal */}
      {showSelector && (
        <View style={styles.selectorOverlay}>
          <View style={styles.selectorModal}>
            <View style={styles.selectorHeader}>
              <Text style={styles.selectorTitle}>
                {isEnglish ? 'Select Property' : 'Choisir une propriété'}
              </Text>
              <TouchableOpacity onPress={() => setShowSelector(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.selectorList}>
              {loadingAvailable ? (
                <View style={styles.selectorLoadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.selectorLoadingText}>
                    {isEnglish ? 'Loading properties...' : 'Chargement...'}
                  </Text>
                </View>
              ) : availableProperties.length > 0 ? (
                availableProperties
                  .filter(p => !selectedProperties.find(sp => sp.id === p.id))
                  .map(property => (
                    <TouchableOpacity 
                      key={property.id}
                      style={styles.selectorItem}
                      onPress={() => {
                        const newSelected = [...selectedProperties];
                        if (selectorSlot < newSelected.length) {
                          newSelected[selectorSlot] = property;
                        } else {
                          newSelected.push(property);
                        }
                        setSelectedProperties(newSelected);
                        setShowSelector(false);
                      }}
                    >
                      {property.images && property.images.length > 0 ? (
                        <Image source={{ uri: property.images[0] }} style={styles.selectorImage} />
                      ) : (
                        <View style={[styles.selectorImage, { backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }]}>
                          <Ionicons name="home-outline" size={24} color={COLORS.textSecondary} />
                        </View>
                      )}
                      <View style={styles.selectorInfo}>
                        <Text style={styles.selectorItemTitle} numberOfLines={1}>
                          {isEnglish ? property.titleEn : property.title}
                        </Text>
                        <Text style={styles.selectorItemPrice}>{formatPrice(property.price)}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
              ) : (
                <View style={styles.selectorEmptyContainer}>
                  <Text style={styles.selectorEmptyText}>
                    {isEnglish ? 'No properties available' : 'Aucune propriété disponible'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
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
  cardsContainer: {
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 16,
    gap: 12,
  },
  propertyCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  propertyImage: {
    width: '100%',
    height: 100,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  changeButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 4,
  },
  propertyTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
    padding: 10,
    paddingBottom: 4,
  },
  propertyPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  addPropertyCard: {
    width: CARD_WIDTH,
    height: 170,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPropertyText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 8,
  },
  comparisonTable: {
    marginHorizontal: SIZES.screenPadding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: 16,
    ...SHADOWS.card,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  comparisonRowHighlight: {
    backgroundColor: COLORS.primaryLight,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  rowLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  rowValues: {
    flexDirection: 'row',
    flex: 2,
    justifyContent: 'space-around',
  },
  rowValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  rowValueBest: {
    color: COLORS.success,
    fontWeight: '600',
  },
  featuresSection: {
    marginHorizontal: SIZES.screenPadding,
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: 16,
    ...SHADOWS.card,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  featureLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  featureValues: {
    flexDirection: 'row',
    flex: 2,
    justifyContent: 'space-around',
  },
  featureValue: {
    flex: 1,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  selectorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  selectorModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  selectorList: {
    padding: 16,
  },
  selectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    marginBottom: 10,
  },
  selectorImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  selectorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  selectorItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  selectorItemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  selectorLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  selectorLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  selectorEmptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  selectorEmptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default ComparePropertiesScreen;

