// Niumba - Register Screen
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
import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { signUp, isConfigured } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const isEnglish = i18n.language === 'en';

  const handleRegister = async () => {
    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Please fill in all required fields' : 'Veuillez remplir tous les champs requis'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Passwords do not match' : 'Les mots de passe ne correspondent pas'
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Password must be at least 6 characters' : 'Le mot de passe doit contenir au moins 6 caractères'
      );
      return;
    }

    if (!acceptTerms) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Please accept the terms and conditions' : 'Veuillez accepter les conditions d\'utilisation'
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
    const { error } = await signUp(email, password, fullName);
    setIsLoading(false);

    if (error) {
      Alert.alert(
        isEnglish ? 'Registration Failed' : 'Échec de l\'inscription',
        error.message
      );
    } else {
      Alert.alert(
        isEnglish ? 'Success!' : 'Succès !',
        isEnglish 
          ? 'Please check your email to verify your account.' 
          : 'Veuillez vérifier votre email pour confirmer votre compte.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
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

          {/* Title */}
          <Text style={styles.title}>
            {isEnglish ? 'Create Account' : 'Créer un compte'}
          </Text>
          <Text style={styles.subtitle}>
            {isEnglish 
              ? 'Sign up to start finding your dream home' 
              : 'Inscrivez-vous pour trouver votre maison de rêve'}
          </Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder={isEnglish ? 'Full name *' : 'Nom complet *'}
                placeholderTextColor={COLORS.textLight}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder={isEnglish ? 'Email address *' : 'Adresse email *'}
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder={isEnglish ? 'Phone number' : 'Numéro de téléphone'}
                placeholderTextColor={COLORS.textLight}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder={isEnglish ? 'Password *' : 'Mot de passe *'}
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                  size={20} 
                  color={COLORS.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder={isEnglish ? 'Confirm password *' : 'Confirmer le mot de passe *'}
                placeholderTextColor={COLORS.textLight}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            {/* Terms Checkbox */}
            <TouchableOpacity 
              style={styles.termsContainer}
              onPress={() => setAcceptTerms(!acceptTerms)}
            >
              <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                {acceptTerms && (
                  <Ionicons name="checkmark" size={16} color={COLORS.white} />
                )}
              </View>
              <Text style={styles.termsText}>
                {isEnglish 
                  ? "I accept the Terms of Service and Privacy Policy" 
                  : "J'accepte les Conditions d'utilisation et la Politique de confidentialité"}
              </Text>
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity 
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.registerButtonText}>
                  {isEnglish ? 'Create Account' : 'Créer le compte'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              {isEnglish ? "Already have an account? " : "Déjà un compte ? "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 32,
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;

