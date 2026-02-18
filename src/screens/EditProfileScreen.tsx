// Niumba - Edit Profile Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { pickImage, takePhoto, uploadImage, deleteImage } from '../services/imageService';
import { updateUser } from '../services/userService';
import { errorLog } from '../utils/logHelper';

interface EditProfileScreenProps {
  navigation: any;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const { user, profile, refreshProfile } = useAuth();
  const isEnglish = i18n.language === 'en';

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePickAvatar = async () => {
    Alert.alert(
      isEnglish ? 'Select Photo' : 'Sélectionner une photo',
      isEnglish ? 'Choose an option' : 'Choisir une option',
      [
        {
          text: isEnglish ? 'Gallery' : 'Galerie',
          onPress: async () => {
            try {
              const uri = await pickImage();
              if (uri) {
                setAvatarUri(uri);
              }
            } catch (error) {
              errorLog('Error picking image', error instanceof Error ? error : new Error(String(error)));
              Alert.alert(
                isEnglish ? 'Error' : 'Erreur',
                isEnglish ? 'Failed to pick image' : 'Échec de la sélection d\'image'
              );
            }
          },
        },
        {
          text: isEnglish ? 'Camera' : 'Caméra',
          onPress: async () => {
            try {
              const uri = await takePhoto();
              if (uri) {
                setAvatarUri(uri);
              }
            } catch (error) {
              errorLog('Error taking photo', error instanceof Error ? error : new Error(String(error)));
              Alert.alert(
                isEnglish ? 'Error' : 'Erreur',
                isEnglish ? 'Failed to take photo' : 'Échec de la prise de photo'
              );
            }
          },
        },
        {
          text: isEnglish ? 'Cancel' : 'Annuler',
          style: 'cancel',
        },
      ]
    );
  };

  const handleRemoveAvatar = () => {
    Alert.alert(
      isEnglish ? 'Remove Photo' : 'Supprimer la photo',
      isEnglish ? 'Are you sure you want to remove your profile photo?' : 'Êtes-vous sûr de vouloir supprimer votre photo de profil ?',
      [
        {
          text: isEnglish ? 'Cancel' : 'Annuler',
          style: 'cancel',
        },
        {
          text: isEnglish ? 'Remove' : 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setAvatarUri(null);
            // If there's an existing avatar, we'll delete it when saving
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'User not found' : 'Utilisateur introuvable'
      );
      return;
    }

    // Validation
    if (fullName.trim().length > 100) {
      Alert.alert(
        isEnglish ? 'Validation Error' : 'Erreur de validation',
        isEnglish ? 'Full name must be less than 100 characters' : 'Le nom complet doit contenir moins de 100 caractères'
      );
      return;
    }

    if (phone.trim() && phone.trim().length < 8) {
      Alert.alert(
        isEnglish ? 'Validation Error' : 'Erreur de validation',
        isEnglish ? 'Phone number must be at least 8 characters' : 'Le numéro de téléphone doit contenir au moins 8 caractères'
      );
      return;
    }

    setSaving(true);

    try {
      let avatarUrl: string | null = profile?.avatar_url || null;

      // Upload new avatar if one was selected
      if (avatarUri) {
        setUploading(true);
        try {
          // Format: {userId}/{filename} for security
          const uploadResult = await uploadImage(avatarUri, user.id, 'avatars', 'avatars');
          if (uploadResult.success && uploadResult.url) {
            avatarUrl = uploadResult.url;
            
            // Delete old avatar if it exists
            if (profile?.avatar_url && profile.avatar_url !== avatarUrl) {
              try {
                await deleteImage(profile.avatar_url, user.id);
              } catch (deleteError) {
                // Log but don't fail the update if deletion fails
                errorLog('Error deleting old avatar', deleteError instanceof Error ? deleteError : new Error(String(deleteError)));
              }
            }
          } else {
            throw new Error(uploadResult.error || 'Upload failed');
          }
        } catch (uploadError) {
          errorLog('Error uploading avatar', uploadError instanceof Error ? uploadError : new Error(String(uploadError)));
          
          // Messages d'erreur plus spécifiques
          let errorMessage = isEnglish 
            ? 'Failed to upload photo. Please try again.' 
            : 'Échec du téléchargement de la photo. Veuillez réessayer.';
          
          if (uploadError instanceof Error) {
            if (uploadError.message.includes('Bucket not found')) {
              errorMessage = isEnglish
                ? 'Storage bucket not configured. Please contact support.'
                : 'Bucket de stockage non configuré. Veuillez contacter le support.';
            } else if (uploadError.message.includes('network') || uploadError.message.includes('Network')) {
              errorMessage = isEnglish
                ? 'Network error. Please check your connection and try again.'
                : 'Erreur réseau. Veuillez vérifier votre connexion et réessayer.';
            } else if (uploadError.message.includes('size') || uploadError.message.includes('too large')) {
              errorMessage = isEnglish
                ? 'Image is too large. Please choose a smaller image.'
                : 'L\'image est trop grande. Veuillez choisir une image plus petite.';
            }
          }
          
          Alert.alert(
            isEnglish ? 'Upload Error' : 'Erreur de téléchargement',
            errorMessage
          );
          setUploading(false);
          setSaving(false);
          return;
        }
        setUploading(false);
      } else if (avatarUri === null && profile?.avatar_url) {
        // User wants to remove the avatar
        try {
          await deleteImage(profile.avatar_url, user.id);
          avatarUrl = null;
        } catch (deleteError) {
          // Log but continue with update
          errorLog('Error deleting avatar', deleteError instanceof Error ? deleteError : new Error(String(deleteError)));
        }
      }

      // Update profile
      const updatedUser = await updateUser(user.id, {
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        avatar_url: avatarUrl,
      });

      if (updatedUser) {
        // Refresh profile in auth context
        await refreshProfile();
        
        Alert.alert(
          isEnglish ? 'Success' : 'Succès',
          isEnglish ? 'Profile updated successfully' : 'Profil mis à jour avec succès',
          [
            {
              text: isEnglish ? 'OK' : 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      errorLog('Error saving profile', error instanceof Error ? error : new Error(String(error)));
      
      // Messages d'erreur plus spécifiques
      let errorMessage = isEnglish 
        ? 'Failed to update profile. Please try again.' 
        : 'Échec de la mise à jour du profil. Veuillez réessayer.';
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('Network')) {
          errorMessage = isEnglish
            ? 'Network error. Please check your connection and try again.'
            : 'Erreur réseau. Veuillez vérifier votre connexion et réessayer.';
        } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
          errorMessage = isEnglish
            ? 'Permission denied. Please make sure you are logged in.'
            : 'Permission refusée. Veuillez vous assurer d\'être connecté.';
        } else if (error.message.includes('timeout')) {
          errorMessage = isEnglish
            ? 'Request timed out. Please try again.'
            : 'La requête a expiré. Veuillez réessayer.';
        }
      }
      
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        errorMessage
      );
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const currentAvatarUri = avatarUri || profile?.avatar_url || null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEnglish ? 'Edit Profile' : 'Modifier le profil'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handlePickAvatar}
            disabled={uploading || saving}
          >
            {currentAvatarUri ? (
              <Image source={{ uri: currentAvatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={50} color={COLORS.textLight} />
              </View>
            )}
            <View style={styles.avatarEditButton}>
              <Ionicons name="camera" size={20} color={COLORS.white} />
            </View>
          </TouchableOpacity>
          
          {currentAvatarUri && (
            <TouchableOpacity
              style={styles.removeAvatarButton}
              onPress={handleRemoveAvatar}
              disabled={uploading || saving}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              <Text style={styles.removeAvatarText}>
                {isEnglish ? 'Remove' : 'Supprimer'}
              </Text>
            </TouchableOpacity>
          )}

          {uploading && (
            <View style={styles.uploadingIndicator}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.uploadingText}>
                {isEnglish ? 'Uploading...' : 'Téléchargement...'}
              </Text>
            </View>
          )}
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {isEnglish ? 'Full Name' : 'Nom complet'}
            </Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder={isEnglish ? 'Enter your full name' : 'Entrez votre nom complet'}
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {isEnglish ? 'Email' : 'Email'}
            </Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user?.email || ''}
              editable={false}
              placeholderTextColor={COLORS.textLight}
            />
            <Text style={styles.inputHint}>
              {isEnglish ? 'Email cannot be changed' : 'L\'email ne peut pas être modifié'}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {isEnglish ? 'Phone' : 'Téléphone'}
            </Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder={isEnglish ? 'Enter your phone number' : 'Entrez votre numéro de téléphone'}
              placeholderTextColor={COLORS.textLight}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.saveButton, (uploading || saving) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={uploading || saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEnglish ? 'Save Changes' : 'Enregistrer les modifications'}
              </Text>
            )}
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.white,
    marginTop: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.small,
  },
  removeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  removeAvatarText: {
    fontSize: 14,
    color: COLORS.error,
    marginLeft: 6,
    fontWeight: '500',
  },
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  uploadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  formSection: {
    backgroundColor: COLORS.white,
    marginTop: 8,
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  inputDisabled: {
    backgroundColor: COLORS.background,
    color: COLORS.textSecondary,
  },
  inputHint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  buttonSection: {
    paddingHorizontal: SIZES.screenPadding,
    marginTop: 24,
  },
  saveButton: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default EditProfileScreen;

