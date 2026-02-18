// Niumba - Contact Form / Inquiry Screen
// COMPTE REQUIS - Les utilisateurs doivent être connectés
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useCreateInquiry } from '../hooks/useInquiries';
import LoginRequired from '../components/LoginRequired';

interface ContactFormScreenProps {
  navigation: any;
  route: {
    params: {
      propertyId: string;
      propertyTitle: string;
      ownerId: string;
      ownerName: string;
    };
  };
}

const ContactFormScreen: React.FC<ContactFormScreenProps> = ({ navigation, route }) => {
  const { i18n } = useTranslation();
  const { user, profile } = useAuth();
  const { propertyId, propertyTitle, ownerId, ownerName } = route.params;
  const isEnglish = i18n.language === 'en';
  
  // Hook Supabase
  const { create: createInquiry, loading: isLoading, error: inquiryError } = useCreateInquiry();
  
  // COMPTE REQUIS: Vérification de l'authentification
  if (!user) {
    return (
      <LoginRequired 
        navigation={navigation}
        icon="mail"
        title={{ 
          fr: 'Contacter le propriétaire', 
          en: 'Contact Owner' 
        }}
        subtitle={{ 
          fr: 'Connectez-vous pour envoyer un message au propriétaire.', 
          en: 'Sign in to send a message to the property owner.' 
        }}
      />
    );
  }

  const [name, setName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    // Validation
    if (!name || !email || !message) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Please fill in all required fields' : 'Veuillez remplir tous les champs requis'
      );
      return;
    }

    const inquiry = await createInquiry(propertyId, {
      sender_name: name,
      sender_email: email,
      sender_phone: phone || undefined,
      subject: `Inquiry about: ${propertyTitle}`,
      message: message,
    });

    if (inquiry) {
      Alert.alert(
        isEnglish ? 'Message Sent!' : 'Message envoyé !',
        isEnglish 
          ? 'Your inquiry has been sent to the property owner. They will contact you soon.'
          : 'Votre demande a été envoyée au propriétaire. Il vous contactera bientôt.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else if (inquiryError) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        inquiryError
      );
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
            {isEnglish ? 'Contact Owner' : 'Contacter le propriétaire'}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Property Info */}
          <View style={styles.propertyInfo}>
            <Ionicons name="home" size={20} color={COLORS.primary} />
            <View style={styles.propertyDetails}>
              <Text style={styles.propertyTitle} numberOfLines={1}>
                {propertyTitle}
              </Text>
              <Text style={styles.ownerName}>
                {isEnglish ? 'Listed by' : 'Proposé par'} {ownerName}
              </Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name */}
            <Text style={styles.label}>
              {isEnglish ? 'Your Name *' : 'Votre nom *'}
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder={isEnglish ? 'Full name' : 'Nom complet'}
                placeholderTextColor={COLORS.textLight}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            {/* Email */}
            <Text style={styles.label}>
              {isEnglish ? 'Email Address *' : 'Adresse email *'}
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder={isEnglish ? 'your@email.com' : 'votre@email.com'}
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Phone */}
            <Text style={styles.label}>
              {isEnglish ? 'Phone Number' : 'Numéro de téléphone'}
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="+243 XX XXX XXXX"
                placeholderTextColor={COLORS.textLight}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Message */}
            <Text style={styles.label}>
              {isEnglish ? 'Message *' : 'Message *'}
            </Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={
                  isEnglish 
                    ? 'I am interested in this property...' 
                    : 'Je suis intéressé par cette propriété...'
                }
                placeholderTextColor={COLORS.textLight}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            {/* Quick Messages */}
            <Text style={styles.quickLabel}>
              {isEnglish ? 'Quick messages:' : 'Messages rapides :'}
            </Text>
            <View style={styles.quickMessages}>
              {[
                isEnglish ? 'I would like to schedule a visit' : 'Je voudrais programmer une visite',
                isEnglish ? 'Is this property still available?' : 'Cette propriété est-elle toujours disponible ?',
                isEnglish ? 'Can you send more details?' : 'Pouvez-vous envoyer plus de détails ?',
              ].map((quickMsg, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickButton}
                  onPress={() => setMessage(quickMsg)}
                >
                  <Text style={styles.quickButtonText}>{quickMsg}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="send" size={20} color={COLORS.white} />
                <Text style={styles.submitButtonText}>
                  {isEnglish ? 'Send Message' : 'Envoyer le message'}
                </Text>
              </>
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
  propertyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: 16,
    borderRadius: SIZES.radius,
    marginTop: 20,
  },
  propertyDetails: {
    flex: 1,
    marginLeft: 12,
  },
  propertyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  ownerName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  form: {
    marginTop: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textAreaContainer: {
    height: 120,
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  textArea: {
    height: 96,
    marginLeft: 0,
  },
  quickLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  quickMessages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  quickButton: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickButtonText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  footer: {
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  submitButton: {
    flexDirection: 'row',
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
    marginLeft: 8,
  },
});

export default ContactFormScreen;

