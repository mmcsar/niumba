// Niumba - Notification Settings Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import notificationService from '../services/notificationService';

const isExpoGo = notificationService.isRunningInExpoGo();

interface NotificationSettingsScreenProps {
  navigation: any;
}

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [settings, setSettings] = useState({
    pushEnabled: true,
    newProperties: true,
    priceDrops: true,
    messages: true,
    appointments: true,
    inquiryResponses: true,
    savedPropertyUpdates: true,
    alertMatches: true,
    promotions: false,
    emailDigest: true,
    emailFrequency: 'daily' as 'daily' | 'weekly' | 'never',
  });

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const granted = await notificationService.getNotificationPermissions();
    setPermissionGranted(granted);
  };

  const requestPermissions = async () => {
    const token = await notificationService.registerForPushNotifications();
    if (token) {
      setPermissionGranted(true);
      Alert.alert(
        isEnglish ? 'Success' : 'Succès',
        isEnglish ? 'Push notifications enabled!' : 'Notifications push activées !'
      );
    } else {
      Alert.alert(
        isEnglish ? 'Permission Required' : 'Permission requise',
        isEnglish 
          ? 'Please enable notifications in your device settings.'
          : 'Veuillez activer les notifications dans les paramètres de votre appareil.',
        [
          { text: isEnglish ? 'Cancel' : 'Annuler', style: 'cancel' },
          { 
            text: isEnglish ? 'Open Settings' : 'Ouvrir Paramètres',
            onPress: () => Linking.openSettings(),
          },
        ]
      );
    }
  };

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const SettingRow: React.FC<{
    icon: string;
    title: string;
    subtitle?: string;
    value: boolean;
    onToggle: (value: boolean) => void;
    disabled?: boolean;
  }> = ({ icon, title, subtitle, value, onToggle, disabled }) => (
    <View style={[styles.settingRow, disabled && styles.settingRowDisabled]}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={22} color={disabled ? COLORS.textLight : COLORS.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, disabled && styles.settingTitleDisabled]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.border, true: COLORS.primary }}
        thumbColor={COLORS.white}
        disabled={disabled}
      />
    </View>
  );

  const FrequencyOption: React.FC<{
    label: string;
    value: string;
    selected: boolean;
    onPress: () => void;
  }> = ({ label, value, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.frequencyOption, selected && styles.frequencyOptionSelected]}
      onPress={onPress}
    >
      <Text style={[styles.frequencyText, selected && styles.frequencyTextSelected]}>
        {label}
      </Text>
      {selected && (
        <Ionicons name="checkmark" size={20} color={COLORS.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEnglish ? 'Notification Settings' : 'Paramètres de notification'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Expo Go Info Banner */}
        {isExpoGo && (
          <View style={styles.expoGoBanner}>
            <Ionicons name="information-circle" size={24} color="#007AFF" />
            <View style={styles.expoGoBannerText}>
              <Text style={styles.expoGoBannerTitle}>
                {isEnglish ? 'Demo Mode' : 'Mode Démo'}
              </Text>
              <Text style={styles.expoGoBannerSubtitle}>
                {isEnglish 
                  ? 'Push notifications are limited in Expo Go. Local notifications work. For full push support, use a development build.'
                  : 'Les notifications push sont limitées dans Expo Go. Les notifications locales fonctionnent. Pour un support complet, utilisez un build de développement.'}
              </Text>
            </View>
          </View>
        )}

        {/* Permission Banner */}
        {!permissionGranted && (
          <View style={styles.permissionBanner}>
            <View style={styles.permissionContent}>
              <Ionicons name="notifications-off" size={24} color="#FF9500" />
              <View style={styles.permissionText}>
                <Text style={styles.permissionTitle}>
                  {isEnglish ? 'Notifications Disabled' : 'Notifications désactivées'}
                </Text>
                <Text style={styles.permissionSubtitle}>
                  {isEnglish 
                    ? 'Enable to receive updates about properties'
                    : 'Activez pour recevoir des mises à jour'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.enableButton} onPress={requestPermissions}>
              <Text style={styles.enableButtonText}>
                {isEnglish ? 'Enable' : 'Activer'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Push Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'PUSH NOTIFICATIONS' : 'NOTIFICATIONS PUSH'}
          </Text>
          <View style={styles.sectionCard}>
            <SettingRow
              icon="notifications"
              title={isEnglish ? 'Push Notifications' : 'Notifications Push'}
              subtitle={isEnglish ? 'Receive push notifications' : 'Recevoir des notifications push'}
              value={settings.pushEnabled}
              onToggle={(v) => updateSetting('pushEnabled', v)}
              disabled={!permissionGranted}
            />
          </View>
        </View>

        {/* Property Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'PROPERTY ALERTS' : 'ALERTES PROPRIÉTÉS'}
          </Text>
          <View style={styles.sectionCard}>
            <SettingRow
              icon="home"
              title={isEnglish ? 'New Properties' : 'Nouvelles propriétés'}
              subtitle={isEnglish ? 'When new properties are listed' : 'Quand de nouvelles propriétés sont publiées'}
              value={settings.newProperties}
              onToggle={(v) => updateSetting('newProperties', v)}
              disabled={!settings.pushEnabled}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="trending-down"
              title={isEnglish ? 'Price Drops' : 'Baisses de prix'}
              subtitle={isEnglish ? 'When saved properties reduce price' : 'Quand les propriétés sauvegardées baissent'}
              value={settings.priceDrops}
              onToggle={(v) => updateSetting('priceDrops', v)}
              disabled={!settings.pushEnabled}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="bookmark"
              title={isEnglish ? 'Saved Property Updates' : 'Mises à jour favoris'}
              subtitle={isEnglish ? 'Changes to your saved properties' : 'Changements sur vos propriétés sauvegardées'}
              value={settings.savedPropertyUpdates}
              onToggle={(v) => updateSetting('savedPropertyUpdates', v)}
              disabled={!settings.pushEnabled}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="search"
              title={isEnglish ? 'Alert Matches' : 'Correspondances alertes'}
              subtitle={isEnglish ? 'Properties matching your alerts' : 'Propriétés correspondant à vos alertes'}
              value={settings.alertMatches}
              onToggle={(v) => updateSetting('alertMatches', v)}
              disabled={!settings.pushEnabled}
            />
          </View>
        </View>

        {/* Communication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'COMMUNICATION' : 'COMMUNICATION'}
          </Text>
          <View style={styles.sectionCard}>
            <SettingRow
              icon="chatbubble"
              title={isEnglish ? 'Messages' : 'Messages'}
              subtitle={isEnglish ? 'New messages from agents' : 'Nouveaux messages des agents'}
              value={settings.messages}
              onToggle={(v) => updateSetting('messages', v)}
              disabled={!settings.pushEnabled}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="calendar"
              title={isEnglish ? 'Appointments' : 'Rendez-vous'}
              subtitle={isEnglish ? 'Appointment confirmations & reminders' : 'Confirmations et rappels de RDV'}
              value={settings.appointments}
              onToggle={(v) => updateSetting('appointments', v)}
              disabled={!settings.pushEnabled}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="mail"
              title={isEnglish ? 'Inquiry Responses' : 'Réponses aux demandes'}
              subtitle={isEnglish ? 'When agents respond to inquiries' : 'Quand les agents répondent'}
              value={settings.inquiryResponses}
              onToggle={(v) => updateSetting('inquiryResponses', v)}
              disabled={!settings.pushEnabled}
            />
          </View>
        </View>

        {/* Email Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'EMAIL PREFERENCES' : 'PRÉFÉRENCES EMAIL'}
          </Text>
          <View style={styles.sectionCard}>
            <SettingRow
              icon="mail-outline"
              title={isEnglish ? 'Email Digest' : 'Résumé par email'}
              subtitle={isEnglish ? 'Receive email summaries' : 'Recevoir des résumés par email'}
              value={settings.emailDigest}
              onToggle={(v) => updateSetting('emailDigest', v)}
            />
            
            {settings.emailDigest && (
              <>
                <View style={styles.divider} />
                <View style={styles.frequencySection}>
                  <Text style={styles.frequencyLabel}>
                    {isEnglish ? 'Frequency' : 'Fréquence'}
                  </Text>
                  <View style={styles.frequencyOptions}>
                    <FrequencyOption
                      label={isEnglish ? 'Daily' : 'Quotidien'}
                      value="daily"
                      selected={settings.emailFrequency === 'daily'}
                      onPress={() => updateSetting('emailFrequency', 'daily')}
                    />
                    <FrequencyOption
                      label={isEnglish ? 'Weekly' : 'Hebdomadaire'}
                      value="weekly"
                      selected={settings.emailFrequency === 'weekly'}
                      onPress={() => updateSetting('emailFrequency', 'weekly')}
                    />
                    <FrequencyOption
                      label={isEnglish ? 'Never' : 'Jamais'}
                      value="never"
                      selected={settings.emailFrequency === 'never'}
                      onPress={() => updateSetting('emailFrequency', 'never')}
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Marketing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'MARKETING' : 'MARKETING'}
          </Text>
          <View style={styles.sectionCard}>
            <SettingRow
              icon="megaphone"
              title={isEnglish ? 'Promotions & Offers' : 'Promotions et offres'}
              subtitle={isEnglish ? 'Special deals and promotions' : 'Offres spéciales et promotions'}
              value={settings.promotions}
              onToggle={(v) => updateSetting('promotions', v)}
            />
          </View>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  expoGoBanner: {
    backgroundColor: '#E3F2FD',
    margin: SIZES.screenPadding,
    borderRadius: SIZES.radiusLarge,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  expoGoBannerText: {
    flex: 1,
    marginLeft: 12,
  },
  expoGoBannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  expoGoBannerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  permissionBanner: {
    backgroundColor: '#FFF8E1',
    margin: SIZES.screenPadding,
    borderRadius: SIZES.radiusLarge,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  permissionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  permissionText: {
    flex: 1,
    marginLeft: 12,
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  permissionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  enableButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 10,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  enableButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: SIZES.screenPadding,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    ...SHADOWS.card,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingRowDisabled: {
    opacity: 0.5,
  },
  settingIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  settingTitleDisabled: {
    color: COLORS.textLight,
  },
  settingSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginLeft: 68,
  },
  frequencySection: {
    padding: 16,
    paddingTop: 12,
  },
  frequencyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    gap: 6,
  },
  frequencyOptionSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  frequencyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  frequencyTextSelected: {
    color: COLORS.primary,
  },
});

export default NotificationSettingsScreen;

