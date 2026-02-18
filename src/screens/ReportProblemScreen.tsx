// Niumba - Report Problem Screen
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
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Linking } from 'react-native';
import COMPANY from '../constants/company';
import { errorLog } from '../utils/logHelper';

interface ReportProblemScreenProps {
  navigation: any;
}

const ReportProblemScreen: React.FC<ReportProblemScreenProps> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const isEnglish = i18n.language === 'en';
  const [problemType, setProblemType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const problemTypes = [
    { value: 'bug', label: isEnglish ? 'Bug / Error' : 'Bug / Erreur', icon: 'bug' },
    { value: 'crash', label: isEnglish ? 'App Crash' : 'Plantage', icon: 'warning' },
    { value: 'performance', label: isEnglish ? 'Performance Issue' : 'Problème de performance', icon: 'speedometer' },
    { value: 'feature', label: isEnglish ? 'Feature Request' : 'Demande de fonctionnalité', icon: 'bulb' },
    { value: 'other', label: isEnglish ? 'Other' : 'Autre', icon: 'ellipsis-horizontal' },
  ];

  const handleSubmit = async () => {
    if (!problemType) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Please select a problem type' : 'Veuillez sélectionner un type de problème'
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Please describe the problem' : 'Veuillez décrire le problème'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Create email content
      const subject = `[Niumba] ${problemTypes.find(t => t.value === problemType)?.label} - Report`;
      const body = `
${isEnglish ? 'Problem Type' : 'Type de problème'}: ${problemTypes.find(t => t.value === problemType)?.label}

${isEnglish ? 'Description' : 'Description'}:
${description}

${isEnglish ? 'Steps to Reproduce' : 'Étapes pour reproduire'}:
${steps || isEnglish ? 'N/A' : 'N/A'}

${isEnglish ? 'User ID' : 'ID utilisateur'}: ${user?.id || 'Guest'}
${isEnglish ? 'Email' : 'Email'}: ${user?.email || 'N/A'}

---
${isEnglish ? 'Reported via Niumba App' : 'Signalé via l\'application Niumba'}
      `.trim();

      // Send via email
      const emailUrl = `mailto:${COMPANY.contact.adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
        Alert.alert(
          isEnglish ? 'Success' : 'Succès',
          isEnglish
            ? 'Your email client will open. Please send the email to report the problem.'
            : 'Votre client email va s\'ouvrir. Veuillez envoyer l\'email pour signaler le problème.',
          [
            {
              text: 'OK',
              onPress: () => {
                setProblemType('');
                setDescription('');
                setSteps('');
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        // Fallback: copy to clipboard or show info
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
      errorLog('Error reporting problem', errorObj, { problemType, userId: user?.id });
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Failed to report problem' : 'Échec du signalement du problème'
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
          {isEnglish ? 'Report a Problem' : 'Signaler un problème'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>
          {isEnglish ? 'What type of problem are you experiencing?' : 'Quel type de problème rencontrez-vous ?'}
        </Text>

        <View style={styles.typeContainer}>
          {problemTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                problemType === type.value && styles.typeButtonSelected,
              ]}
              onPress={() => setProblemType(type.value)}
            >
              <Ionicons
                name={type.icon as any}
                size={24}
                color={problemType === type.value ? COLORS.white : COLORS.primary}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  problemType === type.value && styles.typeButtonTextSelected,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>
          {isEnglish ? 'Describe the problem *' : 'Décrivez le problème *'}
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={isEnglish ? 'Please describe the problem in detail...' : 'Veuillez décrire le problème en détail...'}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <Text style={styles.label}>
          {isEnglish ? 'Steps to Reproduce (Optional)' : 'Étapes pour reproduire (Optionnel)'}
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={isEnglish ? '1. Open the app\n2. Go to...\n3. Click on...' : '1. Ouvrir l\'application\n2. Aller à...\n3. Cliquer sur...'}
          value={steps}
          onChangeText={setSteps}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

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
                {isEnglish ? 'Send Report' : 'Envoyer le rapport'}
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
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.base,
    marginBottom: SIZES.padding * 2,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 8,
    minWidth: '45%',
    ...SHADOWS.small,
  },
  typeButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  typeButtonTextSelected: {
    color: COLORS.white,
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
    minHeight: 120,
    textAlignVertical: 'top',
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

export default ReportProblemScreen;

