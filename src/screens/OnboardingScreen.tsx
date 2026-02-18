// Niumba - Onboarding Screen (Simplified)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation: any;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();

  const handleGetStarted = () => {
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Background Image */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Overlay */}
      <View style={styles.overlay} />

      {/* Content */}
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>N</Text>
          </View>
          <Text style={styles.brandName}>Niumba</Text>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {t('onboarding.title1')}
          </Text>
          <Text style={styles.titleHighlight}>
            {t('onboarding.title2')}
          </Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {t('onboarding.subtitle')}
        </Text>

        {/* Location Tags */}
        <View style={styles.locationTags}>
          <View style={styles.tag}>
            <Ionicons name="location" size={14} color={COLORS.primary} />
            <Text style={styles.tagText}>Haut-Katanga</Text>
          </View>
          <View style={styles.tag}>
            <Ionicons name="location" size={14} color={COLORS.primary} />
            <Text style={styles.tagText}>Lualaba</Text>
          </View>
        </View>

        {/* Get Started Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleGetStarted}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>
            {t('onboarding.getStarted')}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B2B3A',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    opacity: 0.4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 43, 58, 0.6)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: SIZES.screenPadding,
    paddingBottom: 60,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoBox: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 12,
    letterSpacing: 1,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    color: COLORS.white,
    lineHeight: 44,
  },
  titleHighlight: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.white,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
    marginBottom: 24,
  },
  locationTags: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  tagText: {
    fontSize: 13,
    color: COLORS.white,
    marginLeft: 6,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.white,
    marginRight: 10,
  },
});

export default OnboardingScreen;
