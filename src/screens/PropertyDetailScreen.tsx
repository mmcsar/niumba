// Niumba - Property Detail Screen (Zillow Style)
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  StatusBar,
  FlatList,
  Animated,
  Share,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useProperty } from '../hooks/useProperties';
import { ActivityIndicator } from 'react-native';
import { analytics } from '../services/analyticsService';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

interface PropertyDetailScreenProps {
  navigation: any;
  route: {
    params: {
      propertyId: string;
    };
  };
}

const PropertyDetailScreen: React.FC<PropertyDetailScreenProps> = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const { propertyId } = route.params;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { property, loading, error } = useProperty(propertyId);
  const isEnglish = i18n.language === 'en';

  // Logger la vue d'écran et de propriété
  useEffect(() => {
    analytics.logScreenView('PropertyDetailScreen');
    if (property) {
      analytics.logPropertyView(propertyId, property.type, property.price);
    }
  }, [propertyId, property]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.errorContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.errorText}>{isEnglish ? 'Loading...' : 'Chargement...'}</Text>
      </View>
    );
  }

  // Error or not found state
  if (error || !property) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.textLight} />
        <Text style={styles.errorText}>
          {error 
            ? (isEnglish ? 'Error loading property' : 'Erreur lors du chargement')
            : (isEnglish ? 'Property not found' : 'Propriété non trouvée')
          }
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{isEnglish ? 'Back' : 'Retour'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const title = isEnglish ? property.titleEn : property.title;
  const description = isEnglish ? property.descriptionEn : property.description;
  const features = isEnglish ? property.featuresEn : property.features;

  const formatPrice = () => {
    const price = property.price.toLocaleString('en-US');
    if (property.priceType === 'rent') {
      return `$${price}/${isEnglish ? 'mo' : 'mois'}`;
    }
    return `$${price}`;
  };

  const handleCall = () => {
    Linking.openURL(`tel:${property.owner.phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${property.owner.email}?subject=Inquiry about ${title}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this property: ${title} - ${formatPrice()}\n${property.address}, ${property.city}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Animated Header */}
      <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          <TouchableOpacity style={styles.headerButton} onPress={() => setIsSaved(!isSaved)}>
            <Ionicons 
              name={isSaved ? 'heart' : 'heart-outline'} 
              size={24} 
              color={isSaved ? COLORS.heart : COLORS.textPrimary} 
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <FlatList
            data={property.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(index);
            }}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <Image 
                source={{ uri: item }} 
                style={styles.galleryImage}
                resizeMode="cover"
              />
            )}
          />
          
          {/* Overlay Buttons */}
          <View style={styles.overlayButtons}>
            <TouchableOpacity style={styles.overlayButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.overlayRight}>
              <TouchableOpacity style={styles.overlayButton} onPress={handleShare}>
                <Feather name="share" size={22} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.overlayButton, { marginLeft: 12 }]} 
                onPress={() => setIsSaved(!isSaved)}
              >
                <Ionicons 
                  name={isSaved ? 'heart' : 'heart-outline'} 
                  size={24} 
                  color={isSaved ? COLORS.heart : COLORS.white} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Image Pagination */}
          <View style={styles.pagination}>
            <Text style={styles.paginationText}>
              {activeImageIndex + 1} / {property.images.length}
            </Text>
          </View>

          {/* Virtual Tour Button */}
          <TouchableOpacity 
            style={styles.virtualTourButton}
            onPress={() => navigation.navigate('VirtualTour', {
              propertyId: property.id,
              propertyTitle: title,
            })}
          >
            <View style={styles.virtualTourIcon}>
              <Text style={styles.virtualTourIconText}>360°</Text>
            </View>
            <Text style={styles.virtualTourText}>
              {isEnglish ? 'Virtual Tour' : 'Visite Virtuelle'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Price & Type */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice()}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {property.priceType === 'sale' 
                  ? (isEnglish ? 'For Sale' : 'À Vendre')
                  : (isEnglish ? 'For Rent' : 'À Louer')}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{property.bedrooms}</Text>
              <Text style={styles.statLabel}>{isEnglish ? 'beds' : 'chambres'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{property.bathrooms}</Text>
              <Text style={styles.statLabel}>{isEnglish ? 'baths' : 'salles de bain'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{property.area.toLocaleString()}</Text>
              <Text style={styles.statLabel}>m²</Text>
            </View>
            {property.garage > 0 && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{property.garage}</Text>
                  <Text style={styles.statLabel}>{isEnglish ? 'garage' : 'garage'}</Text>
                </View>
              </>
            )}
          </View>

          {/* Address */}
          <View style={styles.addressSection}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <View style={styles.addressText}>
              <Text style={styles.addressMain}>{property.address}</Text>
              <Text style={styles.addressSub}>{property.city}, {property.province}</Text>
            </View>
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('MortgageCalculator', { propertyPrice: property.price })}
            >
              <Ionicons name="calculator" size={20} color={COLORS.primary} />
              <Text style={styles.quickActionText}>
                {isEnglish ? 'Calculator' : 'Calculer'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('CompareProperties', { propertyIds: [property.id] })}
            >
              <Ionicons name="git-compare" size={20} color={COLORS.primary} />
              <Text style={styles.quickActionText}>
                {isEnglish ? 'Compare' : 'Comparer'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => {
                const propertyTitle = isEnglish ? property.titleEn : property.title;
                navigation.navigate('PriceHistory', { 
                  propertyId: property.id, 
                  propertyTitle: propertyTitle,
                  currentPrice: property.price 
                });
              }}
            >
              <Ionicons name="trending-up" size={20} color={COLORS.primary} />
              <Text style={styles.quickActionText}>
                {isEnglish ? 'History' : 'Historique'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => {
                const propertyTitle = isEnglish ? property.titleEn : property.title;
                navigation.navigate('Reviews', { 
                  propertyId: property.id, 
                  propertyTitle: propertyTitle 
                });
              }}
            >
              <Ionicons name="star" size={20} color={COLORS.primary} />
              <Text style={styles.quickActionText}>
                {isEnglish ? 'Reviews' : 'Avis'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isEnglish ? 'About this home' : 'À propos de ce bien'}
            </Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isEnglish ? 'Features' : 'Caractéristiques'}
            </Text>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Agent/Owner Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isEnglish ? 'Listed by' : 'Proposé par'}
            </Text>
            <View style={styles.agentCard}>
              <Image
                source={{ uri: property.owner.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }}
                style={styles.agentAvatar}
                resizeMode="cover"
              />
              <View style={styles.agentInfo}>
                <View style={styles.agentNameRow}>
                  <Text style={styles.agentName}>{property.owner.name}</Text>
                  {property.owner.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                    </View>
                  )}
                </View>
                {property.owner.company && (
                  <Text style={styles.agentCompany}>{property.owner.company}</Text>
                )}
                <Text style={styles.agentProperties}>
                  {property.owner.propertiesCount} {isEnglish ? 'listings' : 'annonces'}
                </Text>
              </View>
            </View>

            {/* Book Appointment Button */}
            <TouchableOpacity 
              style={styles.bookAppointmentButton}
              onPress={() => navigation.navigate('BookAppointment', {
                propertyId: property.id,
                propertyTitle: title,
                ownerName: property.owner.name,
                ownerId: property.owner.id,
              })}
            >
              <Ionicons name="calendar" size={20} color={COLORS.white} />
              <Text style={styles.bookAppointmentText}>
                {isEnglish ? 'Schedule a Visit' : 'Planifier une visite'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Padding */}
          <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
          <Ionicons name="call" size={20} color={COLORS.primary} />
          <Text style={styles.contactButtonText}>{isEnglish ? 'Call' : 'Appeler'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.emailButton} onPress={handleEmail}>
          <Ionicons name="mail" size={20} color={COLORS.white} />
          <Text style={styles.emailButtonText}>{isEnglish ? 'Email' : 'Email'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: COLORS.white,
    paddingTop: 50,
    ...SHADOWS.medium,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  imageGallery: {
    height: HEADER_HEIGHT,
    position: 'relative',
  },
  galleryImage: {
    width: width,
    height: HEADER_HEIGHT,
  },
  overlayButtons: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overlayRight: {
    flexDirection: 'row',
  },
  overlayButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  paginationText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  typeBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addressText: {
    flex: 1,
    marginLeft: 10,
  },
  addressMain: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  addressSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: SIZES.radius,
  },
  agentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  agentInfo: {
    flex: 1,
    marginLeft: 14,
  },
  agentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentName: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  verifiedBadge: {
    marginLeft: 6,
  },
  agentCompany: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  agentProperties: {
    fontSize: 13,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 12,
    paddingBottom: 30,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...SHADOWS.large,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 12,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  emailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    paddingVertical: 8,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius,
  },
  quickActionText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  virtualTourButton: {
    position: 'absolute',
    bottom: 50,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 106, 255, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 8,
  },
  virtualTourIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  virtualTourIconText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  virtualTourText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  bookAppointmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    marginTop: 16,
    gap: 8,
  },
  bookAppointmentText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default PropertyDetailScreen;
