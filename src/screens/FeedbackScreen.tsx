// Niumba - Feedback Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { Linking } from 'react-native';
import COMPANY from '../constants/company';
import { errorLog } from '../utils/logHelper';

interface FeedbackScreenProps {
  navigation: any;
}

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const isEnglish = i18n.language === 'en';
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Please provide your feedback' : 'Veuillez fournir vos commentaires'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Create email content
      const subject = `[Niumba] Feedback - ${rating > 0 ? `${rating}/5 Stars` : 'No Rating'}`;
      const body = `
${isEnglish ? 'Rating' : 'Note'}: ${rating > 0 ? `${rating}/5 ⭐` : isEnglish ? 'No rating' : 'Pas de note'}

${isEnglish ? 'Feedback' : 'Commentaires'}:
${feedback}

${isEnglish ? 'User ID' : 'ID utilisateur'}: ${user?.id || 'Guest'}
${isEnglish ? 'Email' : 'Email'}: ${user?.email || 'N/A'}

---
${isEnglish ? 'Submitted via Niumba App' : 'Soumis via l\'application Niumba'}
      `.trim();

      // Send via email
      const emailUrl = `mailto:${COMPANY.contact.adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
        Alert.alert(
          isEnglish ? 'Success' : 'Succès',
          isEnglish
            ? 'Your email client will open. Please send the email to submit your feedback.'
            : 'Votre client email va s\'ouvrir. Veuillez envoyer l\'email pour soumettre vos commentaires.',
          [
            {
              text: 'OK',
              onPress: () => {
                setRating(0);
                setFeedback('');
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          isEnglish ? 'Email Not Available' : 'Email non disponible',
          isEnglish
            ? `Please send an email to ${COMPANY.contact.adminEmail} with the following information:\n\n${body}`
            : `Veuillez envoyer un email à ${COMPANY.contact.adminEmail} avec les informations suivantes:\n\n${body}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      errorLog('Error submitting feedback', errorObj, { rating, userId: user?.id });
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Failed to submit feedback' : 'Échec de l\'envoi des commentaires'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEnglish ? 'Send Feedback' : 'Envoyer des commentaires'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>
          {isEnglish ? 'How would you rate your experience?' : 'Comment évaluez-vous votre expérience ?'}
        </Text>

        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color={star <= rating ? '#FFD700' : COLORS.textLight}
              />
            </TouchableOpacity>
          ))}
        </View>

        {rating > 0 && (
          <Text style={styles.ratingText}>
            {isEnglish ? `You rated ${rating} out of 5 stars` : `Vous avez noté ${rating} sur 5 étoiles`}
          </Text>
        )}

        <Text style={styles.label}>
          {isEnglish ? 'Your Feedback *' : 'Vos commentaires *'}
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={isEnglish ? 'Tell us what you think about Niumba...' : 'Dites-nous ce que vous pensez de Niumba...'}
          value={feedback}
          onChangeText={setFeedback}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />

        <Text style={styles.hint}>
          {isEnglish
            ? 'Your feedback helps us improve Niumba. Thank you for taking the time to share your thoughts!'
            : 'Vos commentaires nous aident à améliorer Niumba. Merci de prendre le temps de partager vos pensées !'}
        </Text>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="send" size={20} color={COLORS.white} />
              <Text style={styles.submitButtonText}>
                {isEnglish ? 'Send Feedback' : 'Envoyer les commentaires'}
              </Text>
            </>
          )}
        </TouchableOpacity>
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
    paddingVertical: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: SIZES.screenPadding,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.padding,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.base,
    marginBottom: SIZES.padding,
  },
  starButton: {
    padding: SIZES.base,
  },
  ratingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base,
    marginTop: SIZES.padding,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SIZES.base,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    marginTop: SIZES.padding * 2,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default FeedbackScreen;

