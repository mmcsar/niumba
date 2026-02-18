// Niumba - Admin Push Notification Settings Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const AdminNotificationSettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationBody, setNotificationBody] = useState('');
  const [sending, setSending] = useState(false);

  const sendNotification = async () => {
    if (!notificationTitle.trim() || !notificationBody.trim()) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Please fill in all fields' : 'Veuillez remplir tous les champs'
      );
      return;
    }

    setSending(true);
    
    // Simulate sending notification
    setTimeout(() => {
      setSending(false);
      Alert.alert(
        isEnglish ? 'Success' : 'Succès',
        isEnglish ? 'Notification sent to all users!' : 'Notification envoyée à tous les utilisateurs!',
        [{ text: 'OK', onPress: () => { setNotificationTitle(''); setNotificationBody(''); } }]
      );
    }, 1500);
  };

  const QuickTemplate: React.FC<{
    title: string;
    body: string;
    icon: string;
  }> = ({ title, body, icon }) => (
    <TouchableOpacity 
      style={styles.templateCard}
      onPress={() => {
        setNotificationTitle(title);
        setNotificationBody(body);
      }}
    >
      <View style={styles.templateIcon}>
        <Ionicons name={icon as any} size={20} color={COLORS.primary} />
      </View>
      <View style={styles.templateContent}>
        <Text style={styles.templateTitle}>{title}</Text>
        <Text style={styles.templateBody} numberOfLines={1}>{body}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEnglish ? 'Push Notifications' : 'Notifications Push'}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Compose Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'Send Notification' : 'Envoyer une notification'}
          </Text>
          
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? 'Title' : 'Titre'}</Text>
              <TextInput
                style={styles.input}
                value={notificationTitle}
                onChangeText={setNotificationTitle}
                placeholder={isEnglish ? 'Notification title...' : 'Titre de la notification...'}
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? 'Message' : 'Message'}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notificationBody}
                onChangeText={setNotificationBody}
                placeholder={isEnglish ? 'Notification message...' : 'Message de la notification...'}
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={[styles.sendButton, sending && styles.sendButtonDisabled]}
              onPress={sendNotification}
              disabled={sending}
            >
              <Ionicons name="send" size={20} color={COLORS.white} />
              <Text style={styles.sendButtonText}>
                {sending 
                  ? (isEnglish ? 'Sending...' : 'Envoi...') 
                  : (isEnglish ? 'Send to All Users' : 'Envoyer à tous')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'Quick Templates' : 'Modèles rapides'}
          </Text>
          
          <QuickTemplate
            icon="home"
            title={isEnglish ? 'New Properties Available!' : 'Nouvelles propriétés disponibles!'}
            body={isEnglish ? 'Check out the latest listings in your area.' : 'Découvrez les dernières annonces dans votre région.'}
          />
          <QuickTemplate
            icon="pricetag"
            title={isEnglish ? 'Price Drop Alert!' : 'Alerte baisse de prix!'}
            body={isEnglish ? 'Some properties have reduced their prices.' : 'Certaines propriétés ont réduit leurs prix.'}
          />
          <QuickTemplate
            icon="star"
            title={isEnglish ? 'Featured Property' : 'Propriété en vedette'}
            body={isEnglish ? 'Don\'t miss this exceptional property!' : 'Ne manquez pas cette propriété exceptionnelle!'}
          />
          <QuickTemplate
            icon="megaphone"
            title={isEnglish ? 'Special Offer' : 'Offre spéciale'}
            body={isEnglish ? 'Limited time offer on select properties!' : 'Offre limitée sur certaines propriétés!'}
          />
        </View>

        <View style={{ height: 40 }} />
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
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  section: {
    paddingHorizontal: SIZES.screenPadding,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    ...SHADOWS.card,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 10,
    ...SHADOWS.card,
  },
  templateIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateContent: {
    flex: 1,
    marginLeft: 12,
  },
  templateTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  templateBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default AdminNotificationSettingsScreen;

