// Niumba - Share Utilities
import { Share, Linking, Platform, Alert } from 'react-native';
import { Property } from '../types';

const APP_DEEP_LINK_PREFIX = 'niumba://';
const APP_WEB_URL = 'https://niumba.app'; // Replace with actual web URL

export const formatPropertyShareText = (property: Property, isEnglish: boolean): string => {
  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price);

  const details = [];
  if (property.bedrooms) details.push(`${property.bedrooms} ${isEnglish ? 'beds' : 'ch.'}`);
  if (property.bathrooms) details.push(`${property.bathrooms} ${isEnglish ? 'baths' : 'sdb'}`);
  if (property.area) details.push(`${property.area} m²`);

  const message = isEnglish
    ? `🏠 Check out this property on Niumba!\n\n${property.title}\n💰 ${price}\n📍 ${property.city}\n${details.join(' • ')}\n\n`
    : `🏠 Découvrez cette propriété sur Niumba!\n\n${property.title}\n💰 ${price}\n📍 ${property.city}\n${details.join(' • ')}\n\n`;

  return message;
};

export const shareProperty = async (property: Property, isEnglish: boolean): Promise<void> => {
  const message = formatPropertyShareText(property, isEnglish);
  const url = `${APP_WEB_URL}/property/${property.id}`;

  try {
    const result = await Share.share({
      message: `${message}${url}`,
      title: property.title,
      url: url, // iOS only
    });

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        console.log('Shared with activity type:', result.activityType);
      } else {
        console.log('Shared successfully');
      }
    } else if (result.action === Share.dismissedAction) {
      console.log('Share dismissed');
    }
  } catch (error) {
    console.error('Error sharing:', error);
    throw error;
  }
};

export const shareViaWhatsApp = async (property: Property, isEnglish: boolean): Promise<void> => {
  const message = formatPropertyShareText(property, isEnglish);
  const url = `${APP_WEB_URL}/property/${property.id}`;
  const fullMessage = encodeURIComponent(`${message}${url}`);

  const whatsappUrl = Platform.select({
    ios: `whatsapp://send?text=${fullMessage}`,
    android: `whatsapp://send?text=${fullMessage}`,
    default: `https://wa.me/?text=${fullMessage}`,
  });

  const canOpen = await Linking.canOpenURL(whatsappUrl!);
  
  if (canOpen) {
    await Linking.openURL(whatsappUrl!);
  } else {
    // WhatsApp not installed, try web version
    const webWhatsappUrl = `https://wa.me/?text=${fullMessage}`;
    await Linking.openURL(webWhatsappUrl);
  }
};

export const shareViaFacebook = async (property: Property): Promise<void> => {
  const url = encodeURIComponent(`${APP_WEB_URL}/property/${property.id}`);
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  
  await Linking.openURL(facebookUrl);
};

export const shareViaSMS = async (property: Property, isEnglish: boolean): Promise<void> => {
  const message = formatPropertyShareText(property, isEnglish);
  const url = `${APP_WEB_URL}/property/${property.id}`;
  const fullMessage = encodeURIComponent(`${message}${url}`);

  const smsUrl = Platform.select({
    ios: `sms:&body=${fullMessage}`,
    android: `sms:?body=${fullMessage}`,
    default: '',
  });

  if (smsUrl) {
    await Linking.openURL(smsUrl);
  }
};

export const shareViaEmail = async (property: Property, isEnglish: boolean): Promise<void> => {
  const subject = encodeURIComponent(
    isEnglish 
      ? `Check out this property: ${property.title}`
      : `Découvrez cette propriété: ${property.title}`
  );
  const message = formatPropertyShareText(property, isEnglish);
  const url = `${APP_WEB_URL}/property/${property.id}`;
  const body = encodeURIComponent(`${message}${url}`);

  const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
  await Linking.openURL(mailtoUrl);
};

export const copyPropertyLink = async (property: Property, isEnglish: boolean): Promise<boolean> => {
  const url = `${APP_WEB_URL}/property/${property.id}`;
  
  try {
    // Note: In production, use Clipboard API
    // import * as Clipboard from 'expo-clipboard';
    // await Clipboard.setStringAsync(url);
    
    Alert.alert(
      isEnglish ? 'Link Copied!' : 'Lien copié!',
      url
    );
    return true;
  } catch (error) {
    console.error('Error copying link:', error);
    return false;
  }
};

// Deep linking helpers
export const getPropertyDeepLink = (propertyId: string): string => {
  return `${APP_DEEP_LINK_PREFIX}property/${propertyId}`;
};

export const parseDeepLink = (url: string): { screen: string; params: Record<string, string> } | null => {
  if (!url.startsWith(APP_DEEP_LINK_PREFIX)) return null;

  const path = url.replace(APP_DEEP_LINK_PREFIX, '');
  const [screen, ...paramParts] = path.split('/');

  const params: Record<string, string> = {};
  if (screen === 'property' && paramParts[0]) {
    params.propertyId = paramParts[0];
  }

  return { screen, params };
};

