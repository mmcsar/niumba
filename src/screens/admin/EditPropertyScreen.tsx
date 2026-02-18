// Niumba - Edit Property Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useProperty } from '../../hooks/useProperties';
import { pickMultipleImages, takePhoto, uploadMultipleImages, deleteImage } from '../../services/imageService';
import { useAuth } from '../../context/AuthContext';
import { errorLog } from '../../utils/logHelper';
import { logActivity } from '../../services/activityLogService';
import { PropertyType, PriceType } from '../../types/database';
import { CITY_NAMES, getProvinceByCity } from '../../constants/cities';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EditPropertyScreenProps {
  navigation: any;
  route: {
    params: {
      propertyId: string;
    };
  };
}

const EditPropertyScreen: React.FC<EditPropertyScreenProps> = ({ navigation, route }) => {
  const { propertyId } = route.params;
  const { i18n } = useTranslation();
  const { user, profile, isAdmin } = useAuth();
  const isEnglish = i18n.language === 'en';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [images, setImages] = useState<string[]>([]); // URLs existantes + nouvelles URIs locales
  const [existingImages, setExistingImages] = useState<string[]>([]); // URLs existantes dans la DB
  const [newImages, setNewImages] = useState<string[]>([]); // Nouvelles images à uploader
  const [property, setProperty] = useState({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    price: '',
    priceType: 'sale' as PriceType,
    address: '',
    city: '',
    province: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    type: 'house' as PropertyType,
    status: 'active',
  });

  const PROPERTY_TYPES: { value: PropertyType; labelFr: string; labelEn: string }[] = [
    { value: 'house', labelFr: 'Maison', labelEn: 'House' },
    { value: 'apartment', labelFr: 'Appartement', labelEn: 'Apartment' },
    { value: 'flat', labelFr: 'Studio', labelEn: 'Flat' },
    { value: 'townhouse', labelFr: 'Duplex', labelEn: 'Townhouse' },
    { value: 'land', labelFr: 'Terrain', labelEn: 'Land' },
    { value: 'commercial', labelFr: 'Commercial', labelEn: 'Commercial' },
    { value: 'warehouse', labelFr: 'Entrepôt', labelEn: 'Warehouse' },
  ];

  useEffect(() => {
    fetchProperty();
  }, []);

  const fetchProperty = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      Alert.alert(
        isEnglish ? 'Not Configured' : 'Non Configuré',
        isEnglish ? 'Supabase is not configured' : 'Supabase n\'est pas configuré'
      );
      return;
    }

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      
      if (data) {
        const propertyData = data as any;
        setProperty({
          title: propertyData.title || '',
          titleEn: propertyData.title_en || propertyData.title || '',
          description: propertyData.description || '',
          descriptionEn: propertyData.description_en || propertyData.description || '',
          price: propertyData.price?.toString() || '',
          priceType: propertyData.price_type || 'sale',
          address: propertyData.address || '',
          city: propertyData.city || '',
          province: propertyData.province || getProvinceByCity(propertyData.city) || 'Haut-Katanga',
          bedrooms: propertyData.bedrooms?.toString() || '',
          bathrooms: propertyData.bathrooms?.toString() || '',
          area: propertyData.area?.toString() || '',
          type: propertyData.type || 'house',
          status: propertyData.status || 'active',
        });
        
        // Charger les images existantes
        const existingImgs = propertyData.images || [];
        console.log('Loading property images:', existingImgs);
        setExistingImages(existingImgs);
        setImages(existingImgs);
        
        // Vérifier que les images sont bien chargées
        if (existingImgs.length > 0) {
          console.log('First image URL:', existingImgs[0]);
        }
      }
    } catch (error) {
      errorLog('Error fetching property', error instanceof Error ? error : new Error(String(error)), { propertyId });
      Alert.alert(isEnglish ? 'Error' : 'Erreur', isEnglish ? 'Failed to load property' : 'Échec du chargement');
    } finally {
      setLoading(false);
    }
  };

  // Image picker
  const handlePickImages = async () => {
    const maxImages = 10;
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      Alert.alert(
        isEnglish ? 'Maximum Images' : 'Maximum d\'images',
        isEnglish ? 'You can only add up to 10 images' : 'Vous ne pouvez ajouter que 10 images maximum'
      );
      return;
    }

    const pickedImages = await pickMultipleImages(remainingSlots);
    if (pickedImages.length > 0) {
      setImages([...images, ...pickedImages]);
      setNewImages([...newImages, ...pickedImages]);
    }
  };

  const handleTakePhoto = async () => {
    const maxImages = 10;
    if (images.length >= maxImages) {
      Alert.alert(
        isEnglish ? 'Maximum Images' : 'Maximum d\'images',
        isEnglish ? 'You can only add up to 10 images' : 'Vous ne pouvez ajouter que 10 images maximum'
      );
      return;
    }

    const photo = await takePhoto();
    if (photo) {
      setImages([...images, photo]);
      setNewImages([...newImages, photo]);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = images[index];
    
    // Si c'est une image existante (URL), on la retire de existingImages
    // et on la supprime du storage si nécessaire
    if (existingImages.includes(imageToRemove)) {
      setExistingImages(existingImages.filter(img => img !== imageToRemove));
      // Optionnel: supprimer l'image du storage Supabase
      // Les admins peuvent supprimer n'importe quelle image
      if (isSupabaseConfigured() && user) {
        try {
          await deleteImage(imageToRemove, user.id, isAdmin);
        } catch (error) {
          // Ignorer les erreurs de suppression (l'image peut ne plus exister)
          console.log('Could not delete image from storage:', error);
        }
      }
    }
    
    // Si c'est une nouvelle image (URI locale), on la retire de newImages
    if (newImages.includes(imageToRemove)) {
      setNewImages(newImages.filter(img => img !== imageToRemove));
    }
    
    // Retirer de la liste principale
    setImages(images.filter((_, i) => i !== index));
  };

  // Réorganiser les photos (déplacer vers le haut ou le bas)
  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;

    const reorderedImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [reorderedImages[index], reorderedImages[newIndex]] = [reorderedImages[newIndex], reorderedImages[index]];
    setImages(reorderedImages);

    // Mettre à jour existingImages si nécessaire
    const movedImage = images[index];
    if (existingImages.includes(movedImage)) {
      const existingIndex = existingImages.indexOf(movedImage);
      const reorderedExistingImages = [...existingImages];
      const targetExistingIndex = direction === 'up' ? existingIndex - 1 : existingIndex + 1;
      if (targetExistingIndex >= 0 && targetExistingIndex < existingImages.length) {
        [reorderedExistingImages[existingIndex], reorderedExistingImages[targetExistingIndex]] = 
          [reorderedExistingImages[targetExistingIndex], reorderedExistingImages[existingIndex]];
        setExistingImages(reorderedExistingImages);
      }
    }
  };

  const handleSave = async () => {
    if (!property.title.trim() || !property.price.trim()) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Please fill in required fields' : 'Veuillez remplir les champs requis'
      );
      return;
    }

    if (images.length === 0) {
      Alert.alert(
        isEnglish ? 'No Images' : 'Pas d\'images',
        isEnglish ? 'Please add at least one image' : 'Veuillez ajouter au moins une image'
      );
      return;
    }

    setSaving(true);

    if (!isSupabaseConfigured()) {
      // Simulate save
      setTimeout(() => {
        setSaving(false);
        Alert.alert(
          isEnglish ? 'Success' : 'Succès',
          isEnglish ? 'Property updated!' : 'Propriété mise à jour!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }, 1000);
      return;
    }

    try {
      // Utiliser l'ordre actuel des images (qui peut avoir été réorganisé)
      let finalImages = [...images];

      // Séparer les nouvelles images (URIs locales) des images existantes (URLs)
      const imagesToUpload = images.filter(img => newImages.includes(img));
      const existingImageUrls = images.filter(img => existingImages.includes(img));

      // Upload new images if any
      if (imagesToUpload.length > 0) {
        setUploading(true);
        try {
          // Format: {userId}/{filename} for security
          const uploadedUrls = await uploadMultipleImages(
            imagesToUpload,
            user?.id || '',
            'properties',
            (current, total) => setUploadProgress(Math.round((current / total) * 100))
          );
          // Remplacer les URIs locales par les URLs uploadées dans le même ordre
          finalImages = images.map(img => {
            const uploadIndex = imagesToUpload.indexOf(img);
            return uploadIndex >= 0 ? uploadedUrls[uploadIndex] : img;
          });
        } catch (uploadError) {
          errorLog('Error uploading images', uploadError instanceof Error ? uploadError : new Error(String(uploadError)));
          Alert.alert(
            isEnglish ? 'Upload Error' : 'Erreur de téléchargement',
            isEnglish ? 'Failed to upload images. Please try again.' : 'Échec du téléchargement des images. Veuillez réessayer.'
          );
          setUploading(false);
          setSaving(false);
          return;
        }
        setUploading(false);
      }

      // Update property
      const { error } = await (supabase as any)
        .from('properties')
        .update({
          title: property.title,
          title_en: property.titleEn || property.title,
          description: property.description,
          description_en: property.descriptionEn || property.description,
          price: parseFloat(property.price),
          price_type: property.priceType,
          address: property.address,
          city: property.city,
          province: property.province || getProvinceByCity(property.city) || 'Haut-Katanga',
          bedrooms: property.bedrooms ? parseInt(property.bedrooms) : null,
          bathrooms: property.bathrooms ? parseInt(property.bathrooms) : null,
          area: property.area ? parseFloat(property.area) : null,
          type: property.type,
          status: property.status,
          images: finalImages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', propertyId);

      if (error) throw error;

      // Log activity
      if (user && profile) {
        await logActivity({
          user_id: user.id,
          user_name: profile.full_name || user.email || 'Unknown',
          user_role: profile.role || 'user',
          action: 'update',
          resource_type: 'property',
          resource_id: propertyId,
          resource_name: property.title,
          details: {
            changes: {
              title: property.title,
              price: property.price,
              city: property.city,
              status: property.status,
            },
          },
        });
      }

      Alert.alert(
        isEnglish ? 'Success' : 'Succès',
        isEnglish ? 'Property updated!' : 'Propriété mise à jour!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      errorLog('Error updating property', error instanceof Error ? error : new Error(String(error)), { propertyId });
      Alert.alert(isEnglish ? 'Error' : 'Erreur', isEnglish ? 'Failed to update' : 'Échec de la mise à jour');
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEnglish ? 'Edit Property' : 'Modifier la propriété'}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.saveText}>{isEnglish ? 'Save' : 'Sauver'}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{isEnglish ? 'Title (FR)' : 'Titre (FR)'} *</Text>
          <TextInput
            style={styles.input}
            value={property.title}
            onChangeText={(text) => setProperty({ ...property, title: text })}
            placeholder={isEnglish ? 'Property title (French)...' : 'Titre de la propriété (Français)...'}
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{isEnglish ? 'Title (EN)' : 'Titre (EN)'}</Text>
          <TextInput
            style={styles.input}
            value={property.titleEn}
            onChangeText={(text) => setProperty({ ...property, titleEn: text })}
            placeholder={isEnglish ? 'Property title (English)...' : 'Titre de la propriété (Anglais)...'}
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        {/* Property Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{isEnglish ? 'Property Type' : 'Type de propriété'}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            {PROPERTY_TYPES.map((pt) => (
              <TouchableOpacity
                key={pt.value}
                style={[
                  styles.typeButton,
                  property.type === pt.value && styles.typeButtonActive,
                ]}
                onPress={() => setProperty({ ...property, type: pt.value })}
              >
                <Text style={[
                  styles.typeButtonText,
                  property.type === pt.value && styles.typeButtonTextActive,
                ]}>
                  {isEnglish ? pt.labelEn : pt.labelFr}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Price Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{isEnglish ? 'Price Type' : 'Type de prix'}</Text>
          <View style={styles.priceTypeRow}>
            <TouchableOpacity
              style={[
                styles.priceTypeButton,
                property.priceType === 'sale' && styles.priceTypeButtonActive,
              ]}
              onPress={() => setProperty({ ...property, priceType: 'sale' })}
            >
              <Text style={[
                styles.priceTypeButtonText,
                property.priceType === 'sale' && styles.priceTypeButtonTextActive,
              ]}>
                {isEnglish ? 'Sale' : 'Vente'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.priceTypeButton,
                property.priceType === 'rent' && styles.priceTypeButtonActive,
              ]}
              onPress={() => setProperty({ ...property, priceType: 'rent' })}
            >
              <Text style={[
                styles.priceTypeButtonText,
                property.priceType === 'rent' && styles.priceTypeButtonTextActive,
              ]}>
                {isEnglish ? 'Rent' : 'Location'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{isEnglish ? 'Price (USD)' : 'Prix (USD)'} *</Text>
          <TextInput
            style={styles.input}
            value={property.price}
            onChangeText={(text) => setProperty({ ...property, price: text })}
            placeholder="250000"
            placeholderTextColor={COLORS.textLight}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>{isEnglish ? 'Bedrooms' : 'Chambres'}</Text>
            <TextInput
              style={styles.input}
              value={property.bedrooms}
              onChangeText={(text) => setProperty({ ...property, bedrooms: text })}
              placeholder="3"
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>{isEnglish ? 'Bathrooms' : 'Salles de bain'}</Text>
            <TextInput
              style={styles.input}
              value={property.bathrooms}
              onChangeText={(text) => setProperty({ ...property, bathrooms: text })}
              placeholder="2"
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{isEnglish ? 'Area (m²)' : 'Surface (m²)'}</Text>
          <TextInput
            style={styles.input}
            value={property.area}
            onChangeText={(text) => setProperty({ ...property, area: text })}
            placeholder="150"
            placeholderTextColor={COLORS.textLight}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{isEnglish ? 'Address' : 'Adresse'}</Text>
          <TextInput
            style={styles.input}
            value={property.address}
            onChangeText={(text) => setProperty({ ...property, address: text })}
            placeholder={isEnglish ? 'Street address...' : 'Adresse...'}
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{isEnglish ? 'City' : 'Ville'}</Text>
          <TextInput
            style={styles.input}
            value={property.city}
            onChangeText={(text) => setProperty({ ...property, city: text })}
            placeholder="Lubumbashi"
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{isEnglish ? 'Description (FR)' : 'Description (FR)'}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={property.description}
            onChangeText={(text) => setProperty({ ...property, description: text })}
            placeholder={isEnglish ? 'Property description (French)...' : 'Description de la propriété (Français)...'}
            placeholderTextColor={COLORS.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{isEnglish ? 'Description (EN)' : 'Description (EN)'}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={property.descriptionEn}
            onChangeText={(text) => setProperty({ ...property, descriptionEn: text })}
            placeholder={isEnglish ? 'Property description (English)...' : 'Description de la propriété (Anglais)...'}
            placeholderTextColor={COLORS.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Images Section */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {isEnglish ? 'Photos' : 'Photos'} ({images.length}/10)
          </Text>
          
          <View style={styles.imagesRow}>
            {images.map((uri, index) => {
              // Vérifier si c'est une URI locale (file://) ou une URL (http://)
              // Vérifier et normaliser l'URI
              let normalizedUri = uri;
              if (!uri) {
                console.warn('Empty image URI at index:', index);
                normalizedUri = '';
              } else if (!uri.startsWith('http') && !uri.startsWith('file://') && !uri.startsWith('content://')) {
                // Si l'URI ne commence pas par http, file:// ou content://, ajouter https://
                normalizedUri = uri.startsWith('//') ? `https:${uri}` : `https://${uri}`;
              }
              
              const isLocalUri = normalizedUri.startsWith('file://') || normalizedUri.startsWith('content://');
              const imageSource = isLocalUri 
                ? { uri: normalizedUri } 
                : { uri: normalizedUri };
              
              return (
                <View key={`${uri}-${index}`} style={styles.imageContainer}>
                  <Image 
                    source={imageSource} 
                    style={styles.image}
                    resizeMode="cover"
                    onError={(error) => {
                      console.log('Image load error:', error.nativeEvent.error);
                      console.log('Failed to load image:', uri);
                      console.log('Image source:', imageSource);
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', uri);
                    }}
                    onLoadStart={() => {
                      console.log('Image loading started:', uri);
                    }}
                  />
                  {/* Placeholder pendant le chargement */}
                  {!normalizedUri && (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="image-outline" size={32} color={COLORS.textLight} />
                      <Text style={styles.imagePlaceholderText}>
                        {isEnglish ? 'No Image' : 'Pas d\'image'}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color={COLORS.error} />
                  </TouchableOpacity>
                  {index === 0 && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>
                        {isEnglish ? 'Primary' : 'Principale'}
                      </Text>
                    </View>
                  )}
                  {/* Boutons de réorganisation */}
                  <View style={styles.imageActions}>
                    {index > 0 && (
                      <TouchableOpacity
                        style={styles.moveButton}
                        onPress={() => handleMoveImage(index, 'up')}
                      >
                        <Ionicons name="arrow-up" size={16} color={COLORS.white} />
                      </TouchableOpacity>
                    )}
                    {index < images.length - 1 && (
                      <TouchableOpacity
                        style={styles.moveButton}
                        onPress={() => handleMoveImage(index, 'down')}
                      >
                        <Ionicons name="arrow-down" size={16} color={COLORS.white} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
            
            {images.length < 10 && (
              <>
                <TouchableOpacity style={styles.addImageButton} onPress={handlePickImages}>
                  <Ionicons name="images" size={28} color={COLORS.primary} />
                  <Text style={styles.addImageText}>
                    {isEnglish ? 'Add from Gallery' : 'Ajouter de la galerie'}
                  </Text>
                </TouchableOpacity>
                {images.length === 0 && (
                  <TouchableOpacity style={styles.addImageButton} onPress={handleTakePhoto}>
                    <Ionicons name="camera" size={28} color={COLORS.primary} />
                    <Text style={styles.addImageText}>
                      {isEnglish ? 'Take Photo' : 'Prendre une photo'}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {uploading && (
            <View style={styles.uploadProgress}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.uploadProgressText}>
                {isEnglish ? 'Uploading images...' : 'Téléchargement des images...'} {uploadProgress}%
              </Text>
            </View>
          )}
        </View>

        {/* Status Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{isEnglish ? 'Status' : 'Statut'}</Text>
          <View style={styles.statusRow}>
            {['active', 'pending', 'sold'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  property.status === status && styles.statusButtonActive,
                ]}
                onPress={() => setProperty({ ...property, status })}
              >
                <Text style={[
                  styles.statusButtonText,
                  property.status === status && styles.statusButtonTextActive,
                ]}>
                  {status === 'active' 
                    ? (isEnglish ? 'Active' : 'Actif')
                    : status === 'pending'
                    ? (isEnglish ? 'Pending' : 'En attente')
                    : (isEnglish ? 'Sold' : 'Vendu')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  content: {
    padding: SIZES.screenPadding,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    ...SHADOWS.small,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  row: {
    flexDirection: 'row',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statusButtonActive: {
    backgroundColor: COLORS.primary,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  statusButtonTextActive: {
    color: COLORS.white,
  },
  imagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    width: (SCREEN_WIDTH - SIZES.screenPadding * 2 - 24) / 3,
    height: (SCREEN_WIDTH - SIZES.screenPadding * 2 - 24) / 3,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 2,
  },
  addImageButton: {
    width: (SCREEN_WIDTH - SIZES.screenPadding * 2 - 24) / 3,
    height: (SCREEN_WIDTH - SIZES.screenPadding * 2 - 24) / 3,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
  },
  addImageText: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  uploadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius,
  },
  uploadProgressText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  typeScroll: {
    marginTop: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    marginRight: 8,
    ...SHADOWS.small,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  typeButtonTextActive: {
    color: COLORS.white,
  },
  priceTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priceTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  priceTypeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  priceTypeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  priceTypeButtonTextActive: {
    color: COLORS.white,
  },
  imageActions: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
    gap: 4,
  },
  moveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 4,
  },
});

export default EditPropertyScreen;

