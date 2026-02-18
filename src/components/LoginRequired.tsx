// Niumba - Login Required Component
// Affiche un écran invitant l'utilisateur à se connecter

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

interface LoginRequiredProps {
  navigation: any;
  icon?: string;
  title?: { fr: string; en: string };
  subtitle?: { fr: string; en: string };
  showExplore?: boolean;
}

const LoginRequired: React.FC<LoginRequiredProps> = ({
  navigation,
  icon = 'lock-closed',
  title = { fr: 'Connexion requise', en: 'Login Required' },
  subtitle = { 
    fr: 'Créez un compte gratuit pour accéder à cette fonctionnalité.', 
    en: 'Create a free account to access this feature.' 
  },
  showExplore = true,
}) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={48} color={COLORS.primary} />
        </View>
        
        <Text style={styles.title}>
          {isEnglish ? title.en : title.fr}
        </Text>
        
        <Text style={styles.subtitle}>
          {isEnglish ? subtitle.en : subtitle.fr}
        </Text>
        
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Ionicons name="log-in-outline" size={20} color={COLORS.white} />
          <Text style={styles.loginButtonText}>
            {isEnglish ? 'Sign In' : 'Se connecter'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerButtonText}>
            {isEnglish ? 'Create Account' : 'Créer un compte'}
          </Text>
        </TouchableOpacity>
        
        {showExplore && (
          <TouchableOpacity 
            style={styles.exploreLink}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.exploreLinkText}>
              {isEnglish ? 'Continue browsing without account' : 'Continuer sans compte'}
            </Text>
          </TouchableOpacity>
        )}
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
    width: 100,
    height: 100,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  loginButton: {
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
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  registerButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    width: '100%',
    alignItems: 'center',
  },
  registerButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  exploreLink: {
    marginTop: 24,
    paddingVertical: 12,
  },
  exploreLinkText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginRequired;

