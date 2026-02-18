// Niumba - Image Upload Service
import * as ImagePicker from 'expo-image-picker';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Alert } from 'react-native';

const BUCKET_NAME = 'property-images';
const AVATAR_BUCKET_NAME = 'avatars';

interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Request permissions
export const requestImagePermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission requise',
      'Veuillez autoriser l\'accès à la galerie pour ajouter des photos.'
    );
    return false;
  }
  return true;
};

export const requestCameraPermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission requise',
      'Veuillez autoriser l\'accès à la caméra pour prendre des photos.'
    );
    return false;
  }
  return true;
};

// Pick image from gallery
export const pickImage = async (): Promise<string | null> => {
  const hasPermission = await requestImagePermissions();
  if (!hasPermission) return null;

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
  } catch (error) {
    console.error('Error picking image:', error);
  }
  return null;
};

// Pick multiple images from gallery
export const pickMultipleImages = async (maxImages: number = 10): Promise<string[]> => {
  const hasPermission = await requestImagePermissions();
  if (!hasPermission) return [];

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: maxImages,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      return result.assets.map(asset => asset.uri);
    }
  } catch (error) {
    console.error('Error picking images:', error);
  }
  return [];
};

// Take photo with camera
export const takePhoto = async (): Promise<string | null> => {
  const hasPermission = await requestCameraPermissions();
  if (!hasPermission) return null;

  try {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
  } catch (error) {
    console.error('Error taking photo:', error);
  }
  return null;
};

// Upload image to Supabase Storage
export const uploadImage = async (
  uri: string,
  userId: string, // Required: user ID for security (path: {userId}/{filename})
  folder: string = 'properties',
  bucketName?: string
): Promise<ImageUploadResult> => {
  if (!isSupabaseConfigured()) {
    // Return mock URL for demo
    return {
      success: true,
      url: uri, // Just use local URI in demo mode
    };
  }

  if (!userId) {
    return {
      success: false,
      error: 'User ID is required for secure image upload',
    };
  }

  try {
    // Determine bucket: use provided bucket or default to property-images
    const bucket = bucketName || BUCKET_NAME;
    
    // Generate unique filename with userId in path for security
    // Format: {userId}/{timestamp}_{random}.jpg
    // This ensures RLS policies can verify ownership
    const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    
    // Fetch the image and convert to blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Convert blob to array buffer
    const arrayBuffer = await new Response(blob).arrayBuffer();
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// Upload multiple images in parallel for better performance
export const uploadMultipleImages = async (
  uris: string[],
  userId: string, // Required: user ID for security
  folder: string = 'properties',
  onProgress?: (current: number, total: number) => void
): Promise<string[]> => {
  if (uris.length === 0) return [];
  
  if (!userId) {
    console.error('User ID is required for secure image upload');
    return [];
  }
  
  // Upload images in parallel (faster than sequential)
  const uploadPromises = uris.map(async (uri, index) => {
    const result = await uploadImage(uri, userId, folder);
    onProgress?.(index + 1, uris.length);
    return result;
  });
  
  const results = await Promise.all(uploadPromises);
  
  // Filter successful uploads
  const uploadedUrls = results
    .filter(result => result.success && result.url)
    .map(result => result.url!);
  
  return uploadedUrls;
};

// Delete image from Supabase Storage
export const deleteImage = async (
  url: string, 
  userId?: string, 
  isAdmin: boolean = false
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return true;

  try {
    // Extract file path from URL
    // Format: {bucket}/{userId}/{filename}
    const urlParts = url.split('/');
    
    // Trouver le bucket depuis l'URL
    let bucketName = BUCKET_NAME; // Par défaut
    let filePath = '';
    
    // Détecter le bucket depuis l'URL
    if (url.includes('/avatars/')) {
      bucketName = AVATAR_BUCKET_NAME;
      // Extraire le chemin après /avatars/
      const avatarsIndex = url.indexOf('/avatars/');
      filePath = url.substring(avatarsIndex + '/avatars/'.length);
    } else if (url.includes('/property-images/')) {
      bucketName = BUCKET_NAME;
      const propertyIndex = url.indexOf('/property-images/');
      filePath = url.substring(propertyIndex + '/property-images/'.length);
    } else {
      // Fallback: utiliser les 2 derniers segments (userId/filename)
      filePath = urlParts.slice(-2).join('/');
    }
    
    // Verify ownership if userId is provided (skip check for admins)
    if (userId && !isAdmin) {
      const pathUserId = filePath.split('/')[0];
      if (pathUserId !== userId) {
        console.error('Cannot delete: User does not own this image');
        return false;
      }
    }
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

export default {
  requestImagePermissions,
  requestCameraPermissions,
  pickImage,
  pickMultipleImages,
  takePhoto,
  uploadImage,
  uploadMultipleImages,
  deleteImage,
};
