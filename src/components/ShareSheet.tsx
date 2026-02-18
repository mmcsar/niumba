// Niumba - Share Sheet Component
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Property } from '../types';
import {
  shareProperty,
  shareViaWhatsApp,
  shareViaFacebook,
  shareViaSMS,
  shareViaEmail,
  copyPropertyLink,
} from '../utils/shareUtils';

interface ShareSheetProps {
  visible: boolean;
  onClose: () => void;
  property: Property;
}

const ShareSheet: React.FC<ShareSheetProps> = ({ visible, onClose, property }) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const handleShare = async (method: string) => {
    try {
      switch (method) {
        case 'native':
          await shareProperty(property, isEnglish);
          break;
        case 'whatsapp':
          await shareViaWhatsApp(property, isEnglish);
          break;
        case 'facebook':
          await shareViaFacebook(property);
          break;
        case 'sms':
          await shareViaSMS(property, isEnglish);
          break;
        case 'email':
          await shareViaEmail(property, isEnglish);
          break;
        case 'copy':
          await copyPropertyLink(property, isEnglish);
          break;
      }
      onClose();
    } catch (error) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Could not share this property' : 'Impossible de partager cette propriété'
      );
    }
  };

  const ShareOption: React.FC<{
    icon: string;
    iconColor: string;
    label: string;
    onPress: () => void;
  }> = ({ icon, iconColor, label, onPress }) => (
    <TouchableOpacity style={styles.option} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
      </View>
      <Text style={styles.optionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          
          <Text style={styles.title}>
            {isEnglish ? 'Share Property' : 'Partager la propriété'}
          </Text>

          <View style={styles.optionsGrid}>
            <ShareOption
              icon="logo-whatsapp"
              iconColor="#25D366"
              label="WhatsApp"
              onPress={() => handleShare('whatsapp')}
            />
            <ShareOption
              icon="logo-facebook"
              iconColor="#1877F2"
              label="Facebook"
              onPress={() => handleShare('facebook')}
            />
            <ShareOption
              icon="chatbubble"
              iconColor="#34C759"
              label="SMS"
              onPress={() => handleShare('sms')}
            />
            <ShareOption
              icon="mail"
              iconColor="#EA4335"
              label="Email"
              onPress={() => handleShare('email')}
            />
            <ShareOption
              icon="copy"
              iconColor={COLORS.primary}
              label={isEnglish ? 'Copy Link' : 'Copier lien'}
              onPress={() => handleShare('copy')}
            />
            <ShareOption
              icon="share-outline"
              iconColor={COLORS.textSecondary}
              label={isEnglish ? 'More' : 'Plus'}
              onPress={() => handleShare('native')}
            />
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>
              {isEnglish ? 'Cancel' : 'Annuler'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SIZES.screenPadding,
    paddingBottom: 34,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.borderLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  option: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

export default ShareSheet;

