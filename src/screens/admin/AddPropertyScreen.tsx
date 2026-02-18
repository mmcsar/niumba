// Niumba - Add/Edit Property Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { pickMultipleImages, uploadMultipleImages, takePhoto } from '../../services/imageService';
import { PropertyType, PriceType } from '../../types/database';
import { useAgents } from '../../hooks/useAgents';
import type { Agent } from '../../services/agentService';
import { logActivity } from '../../services/activityLogService';

interface AddPropertyScreenProps {
  navigation: any;
}

const PROPERTY_TYPES: { value: PropertyType; labelFr: string; labelEn: string }[] = [
  { value: 'house', labelFr: 'Maison', labelEn: 'House' },
  { value: 'apartment', labelFr: 'Appartement', labelEn: 'Apartment' },
  { value: 'flat', labelFr: 'Studio', labelEn: 'Flat' },
  { value: 'townhouse', labelFr: 'Duplex', labelEn: 'Townhouse' },
  { value: 'land', labelFr: 'Terrain', labelEn: 'Land' },
  { value: 'commercial', labelFr: 'Commercial', labelEn: 'Commercial' },
  { value: 'warehouse', labelFr: 'Entrepôt', labelEn: 'Warehouse' },
];

import { CITY_NAMES, getProvinceByCity } from '../../constants/cities';

const CITIES = CITY_NAMES;

const AddPropertyScreen: React.FC<AddPropertyScreenProps> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const { user, profile } = useAuth();
  const isEnglish = i18n.language === 'en';

  // Form state
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [type, setType] = useState<PropertyType>('house');
  const [priceType, setPriceType] = useState<PriceType>('sale');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Lubumbashi');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [area, setArea] = useState('');
  const [features, setFeatures] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);

  // Fetch agents
  const { agents, loading: agentsLoading } = useAgents({
    isActive: true,
    isVerified: true,
  });

  // Image picker
  const handlePickImages = async () => {
    const pickedImages = await pickMultipleImages(10 - images.length);
    if (pickedImages.length > 0) {
      setImages([...images, ...pickedImages]);
    }
  };

  const handleTakePhoto = async () => {
    const photo = await takePhoto();
    if (photo) {
      setImages([...images, photo]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Submit form
  const handleSubmit = async () => {
    // Validation
    if (!title || !description || !price || !address) {
      Alert.alert(
        isEnglish ? 'Missing Information' : 'Informations manquantes',
        isEnglish ? 'Please fill in all required fields' : 'Veuillez remplir tous les champs requis'
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

    setIsLoading(true);

    try {
      if (!isSupabaseConfigured()) {
        // Demo mode
        setTimeout(() => {
          setIsLoading(false);
          Alert.alert(
            isEnglish ? 'Success!' : 'Succès !',
            isEnglish 
              ? 'Property added successfully (Demo Mode)' 
              : 'Propriété ajoutée avec succès (Mode Démo)',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }, 1500);
        return;
      }

      // OPTIMIZATION: Create property first with empty images array
      // This makes the property visible immediately
      const insertResult: any = await supabase
        .from('properties')
        .insert({
          owner_id: user!.id,
          title,
          title_en: titleEn || title,
          description,
          description_en: descriptionEn || description,
          type,
          price_type: priceType,
          price: parseFloat(price),
          address,
          city,
          province: getProvinceByCity(city) || 'Haut-Katanga',
          bedrooms: parseInt(bedrooms) || 0,
          bathrooms: parseInt(bathrooms) || 0,
          area: parseFloat(area) || null,
          features: features.split(',').map(f => f.trim()).filter(Boolean),
          images: [], // Empty initially, will be updated after upload
          status: profile?.role === 'admin' ? 'active' : 'pending',
          agent_id: selectedAgent?.id || null,
        } as any)
        .select()
        .single();

      if (insertResult.error) throw insertResult.error;
      if (!insertResult.data) throw new Error('Failed to create property');

      // Property is now created and visible!
      // Upload images in background and update property
      const propertyId = insertResult.data.id;

      // Upload images in parallel (faster)
      // Format: {userId}/{filename} for security
      const uploadedUrls = await uploadMultipleImages(
        images,
        user?.id || '',
        'properties',
        (current, total) => setUploadProgress(Math.round((current / total) * 100))
      );

      // Update property with image URLs
      if (uploadedUrls.length > 0 && user) {
        try {
          const { error: updateError } = await (supabase
            .from('properties') as any)
            .update({ images: uploadedUrls } as any)
            .eq('id', propertyId);
          
          if (updateError) {
            // Log error but don't fail - property is already created
            console.error('Error updating images:', updateError);
          }
        } catch (updateErr) {
          // Log error but don't fail - property is already created
          console.error('Error updating images:', updateErr);
        }
      }

      // Log activity
      if (user) {
        await logActivity({
          user_id: user.id,
          user_name: profile?.full_name || user.email || 'Unknown',
          user_role: profile?.role || 'user',
          action: 'create',
          resource_type: 'property',
          resource_id: propertyId,
          resource_name: title,
          details: {
            city,
            price: parseFloat(price),
            type,
            status: profile?.role === 'admin' ? 'active' : 'pending',
          },
        });
      }

      Alert.alert(
        isEnglish ? 'Success!' : 'Succès !',
        isEnglish 
          ? 'Property added successfully. It will be reviewed shortly.' 
          : 'Propriété ajoutée avec succès. Elle sera examinée prochainement.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error adding property:', error);
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Failed to add property' : 'Échec de l\'ajout de la propriété'
      );
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEnglish ? 'Add Property' : 'Ajouter une propriété'}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Images Section */}
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'Photos *' : 'Photos *'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.imagesRow}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Ionicons name="close" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              ))}
              
              {images.length < 10 && (
                <View style={styles.addImageButtons}>
                  <TouchableOpacity style={styles.addImageButton} onPress={handlePickImages}>
                    <Ionicons name="images" size={28} color={COLORS.primary} />
                    <Text style={styles.addImageText}>
                      {isEnglish ? 'Gallery' : 'Galerie'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addImageButton} onPress={handleTakePhoto}>
                    <Ionicons name="camera" size={28} color={COLORS.primary} />
                    <Text style={styles.addImageText}>
                      {isEnglish ? 'Camera' : 'Caméra'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Basic Info */}
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'Basic Information' : 'Informations de base'}
          </Text>
          
          <Text style={styles.label}>{isEnglish ? 'Title (French) *' : 'Titre (Français) *'}</Text>
          <TextInput
            style={styles.input}
            placeholder={isEnglish ? 'e.g. Modern Villa in Golf' : 'ex. Villa Moderne Golf'}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>{isEnglish ? 'Title (English)' : 'Titre (Anglais)'}</Text>
          <TextInput
            style={styles.input}
            placeholder={isEnglish ? 'English title (optional)' : 'Titre en anglais (optionnel)'}
            value={titleEn}
            onChangeText={setTitleEn}
          />

          {/* Property Type */}
          <Text style={styles.label}>{isEnglish ? 'Property Type' : 'Type de bien'}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.typeRow}>
              {PROPERTY_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.typeButton, type === t.value && styles.typeButtonActive]}
                  onPress={() => setType(t.value)}
                >
                  <Text style={[styles.typeButtonText, type === t.value && styles.typeButtonTextActive]}>
                    {isEnglish ? t.labelEn : t.labelFr}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Price Type */}
          <Text style={styles.label}>{isEnglish ? 'Listing Type' : 'Type d\'annonce'}</Text>
          <View style={styles.priceTypeRow}>
            <TouchableOpacity
              style={[styles.priceTypeButton, priceType === 'sale' && styles.priceTypeButtonActive]}
              onPress={() => setPriceType('sale')}
            >
              <Text style={[styles.priceTypeText, priceType === 'sale' && styles.priceTypeTextActive]}>
                {isEnglish ? 'For Sale' : 'À Vendre'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.priceTypeButton, priceType === 'rent' && styles.priceTypeButtonActive]}
              onPress={() => setPriceType('rent')}
            >
              <Text style={[styles.priceTypeText, priceType === 'rent' && styles.priceTypeTextActive]}>
                {isEnglish ? 'For Rent' : 'À Louer'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Price */}
          <Text style={styles.label}>{isEnglish ? 'Price (USD) *' : 'Prix (USD) *'}</Text>
          <TextInput
            style={styles.input}
            placeholder="250000"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          {/* Location */}
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'Location' : 'Localisation'}
          </Text>

          <Text style={styles.label}>{isEnglish ? 'Address *' : 'Adresse *'}</Text>
          <TextInput
            style={styles.input}
            placeholder={isEnglish ? 'Street address' : 'Adresse complète'}
            value={address}
            onChangeText={setAddress}
          />

          <Text style={styles.label}>{isEnglish ? 'City' : 'Ville'}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.typeRow}>
              {CITIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.typeButton, city === c && styles.typeButtonActive]}
                  onPress={() => setCity(c)}
                >
                  <Text style={[styles.typeButtonText, city === c && styles.typeButtonTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Agent Selection */}
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'Assigned Agent' : 'Agent assigné'}
          </Text>
          
          <TouchableOpacity
            style={styles.agentSelector}
            onPress={() => setShowAgentModal(true)}
          >
            {selectedAgent ? (
              <View style={styles.selectedAgent}>
                {selectedAgent.avatar_url ? (
                  <Image source={{ uri: selectedAgent.avatar_url }} style={styles.agentAvatar} />
                ) : (
                  <View style={[styles.agentAvatar, styles.agentAvatarPlaceholder]}>
                    <Text style={styles.agentAvatarText}>
                      {selectedAgent.full_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.agentInfo}>
                  <Text style={styles.agentName}>{selectedAgent.full_name}</Text>
                  {selectedAgent.agency_name && (
                    <Text style={styles.agentAgency}>{selectedAgent.agency_name}</Text>
                  )}
                  {selectedAgent.license_number && (
                    <Text style={styles.agentLicense}>{selectedAgent.license_number}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.removeAgentButton}
                  onPress={() => setSelectedAgent(null)}
                >
                  <Ionicons name="close-circle" size={24} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.agentSelectorPlaceholder}>
                <Ionicons name="person-add" size={24} color={COLORS.textLight} />
                <Text style={styles.agentSelectorText}>
                  {isEnglish ? 'Select an agent (optional)' : 'Sélectionner un agent (optionnel)'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Details */}
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'Details' : 'Détails'}
          </Text>

          <View style={styles.detailsRow}>
            <View style={styles.detailInput}>
              <Text style={styles.label}>{isEnglish ? 'Beds' : 'Chambres'}</Text>
              <TextInput
                style={styles.input}
                placeholder="3"
                value={bedrooms}
                onChangeText={setBedrooms}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.detailInput}>
              <Text style={styles.label}>{isEnglish ? 'Baths' : 'SdB'}</Text>
              <TextInput
                style={styles.input}
                placeholder="2"
                value={bathrooms}
                onChangeText={setBathrooms}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.detailInput}>
              <Text style={styles.label}>m²</Text>
              <TextInput
                style={styles.input}
                placeholder="200"
                value={area}
                onChangeText={setArea}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'Description' : 'Description'}
          </Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={isEnglish ? 'Describe your property...' : 'Décrivez votre propriété...'}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          {/* Features */}
          <Text style={styles.label}>{isEnglish ? 'Features (comma separated)' : 'Caractéristiques (séparées par virgule)'}</Text>
          <TextInput
            style={styles.input}
            placeholder={isEnglish ? 'Pool, Garden, Security...' : 'Piscine, Jardin, Sécurité...'}
            value={features}
            onChangeText={setFeatures}
          />

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Agent Selection Modal */}
        <Modal
          visible={showAgentModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowAgentModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isEnglish ? 'Select Agent' : 'Sélectionner un agent'}
                </Text>
                <TouchableOpacity onPress={() => setShowAgentModal(false)}>
                  <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
              
              {agentsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              ) : (
                <FlatList
                  data={agents}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.agentOption,
                        selectedAgent?.id === item.id && styles.agentOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedAgent(item);
                        setShowAgentModal(false);
                      }}
                    >
                      {item.avatar_url ? (
                        <Image source={{ uri: item.avatar_url }} style={styles.agentOptionAvatar} />
                      ) : (
                        <View style={[styles.agentOptionAvatar, styles.agentAvatarPlaceholder]}>
                          <Text style={styles.agentAvatarText}>
                            {item.full_name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.agentOptionInfo}>
                        <Text style={styles.agentOptionName}>{item.full_name}</Text>
                        {item.agency_name && (
                          <Text style={styles.agentOptionAgency}>{item.agency_name}</Text>
                        )}
                        {item.license_number && (
                          <Text style={styles.agentOptionLicense}>{item.license_number}</Text>
                        )}
                      </View>
                      {selectedAgent?.id === item.id && (
                        <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Ionicons name="people-outline" size={48} color={COLORS.textLight} />
                      <Text style={styles.emptyText}>
                        {isEnglish ? 'No agents available' : 'Aucun agent disponible'}
                      </Text>
                    </View>
                  }
                />
              )}
            </View>
          </View>
        </Modal>

        {/* Submit Button */}
        <View style={styles.footer}>
          {uploadProgress > 0 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
              <Text style={styles.progressText}>
                {isEnglish ? 'Uploading images...' : 'Téléchargement des images...'} {uploadProgress}%
              </Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEnglish ? 'Publish Property' : 'Publier la propriété'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    paddingHorizontal: SIZES.screenPadding,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 24,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  imagesRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: SIZES.radius,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButtons: {
    flexDirection: 'row',
  },
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  addImageText: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  typeRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  priceTypeRow: {
    flexDirection: 'row',
  },
  priceTypeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceTypeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  priceTypeText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  priceTypeTextActive: {
    color: COLORS.white,
  },
  detailsRow: {
    flexDirection: 'row',
  },
  detailInput: {
    flex: 1,
    marginRight: 12,
  },
  footer: {
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  progressContainer: {
    height: 24,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '600',
  },
  agentSelector: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedAgent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  agentSelectorPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  agentSelectorText: {
    fontSize: 15,
    color: COLORS.textLight,
  },
  agentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  agentAvatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  agentAgency: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  agentLicense: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  removeAgentButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  agentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 12,
  },
  agentOptionSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  agentOptionAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  agentOptionInfo: {
    flex: 1,
  },
  agentOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  agentOptionAgency: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  agentOptionLicense: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
});

export default AddPropertyScreen;

