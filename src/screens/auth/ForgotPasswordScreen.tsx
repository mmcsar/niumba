// Niumba - Forgot Password Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

interface ForgotPasswordScreenProps {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { resetPassword, isConfigured } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isEnglish = i18n.language === 'en';

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Please enter your email address' : 'Veuillez entrer votre adresse email'
      );
      return;
    }

    if (!isConfigured) {
      Alert.alert(
        isEnglish ? 'Not Configured' : 'Non Configuré',
        isEnglish 
          ? 'Supabase is not configured. Please add your API keys.' 
          : 'Supabase n\'est pas configuré. Veuillez ajouter vos clés API.'
      );
      return;
    }

    setIsLoading(true);
    const { error } = await resetPassword(email);
    setIsLoading(false);

    if (error) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        error.message || (isEnglish ? 'Failed to send reset email' : 'Échec de l\'envoi de l\'email de réinitialisation')
      );
    } else {
      Alert.alert(
        isEnglish ? 'Email Sent' : 'Email Envoyé',
        isEnglish 
          ? 'A password reset link has been sent to your email address.' 
          : 'Un lien de réinitialisation de mot de passe a été envoyé à votre adresse email.',
        [
          {
            text: isEnglish ? 'OK' : 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="lock-closed" size={32} color={COLORS.white} />
            </View>
            <Text style={styles.brandName}>Niumba</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {isEnglish ? 'Forgot Password?' : 'Mot de passe oublié ?'}
          </Text>
          <Text style={styles.subtitle}>
            {isEnglish 
              ? 'Enter your email address and we\'ll send you a link to reset your password.' 
              : 'Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.'}
          </Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder={isEnglish ? 'Email address' : 'Adresse email'}
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>

            {/* Reset Button */}
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.resetButtonText}>
                  {isEnglish ? 'Send Reset Link' : 'Envoyer le lien'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Back to Login */}
          <View style={styles.backToLoginContainer}>
            <Text style={styles.backToLoginText}>
              {isEnglish ? 'Remember your password? ' : 'Vous vous souvenez de votre mot de passe ? '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.backToLoginLink}>
                {isEnglish ? 'Sign in' : 'Se connecter'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.screenPadding,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    marginTop: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logo: {
    width: 64,
    height: 64,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 22,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  resetButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '600',
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  backToLoginText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  backToLoginLink: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;


