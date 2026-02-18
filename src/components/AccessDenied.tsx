// Niumba - Access Denied Component
// Affiché quand un utilisateur tente d'accéder à une zone non autorisée

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

interface AccessDeniedProps {
  navigation: any;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-outline" size={64} color={COLORS.error} />
        </View>
        
        <Text style={styles.title}>
          {isEnglish ? 'Access Denied' : 'Accès Refusé'}
        </Text>
        
        <Text style={styles.subtitle}>
          {isEnglish 
            ? 'You do not have permission to access this area. This section is reserved for administrators only.'
            : 'Vous n\'avez pas la permission d\'accéder à cette zone. Cette section est réservée aux administrateurs.'}
        </Text>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.white} />
          <Text style={styles.backButtonText}>
            {isEnglish ? 'Go Back' : 'Retour'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => navigation.navigate('MainTabs')}
        >
          <Text style={styles.homeButtonText}>
            {isEnglish ? 'Return to Home' : 'Retour à l\'accueil'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding * 2,
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#FFE8EC',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    marginBottom: 12,
    width: '100%',
    justifyContent: 'center',
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  homeButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
    alignItems: 'center',
  },
  homeButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccessDenied;

