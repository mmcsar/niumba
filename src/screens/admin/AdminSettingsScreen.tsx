// Niumba - Admin Settings Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const AdminSettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const [settings, setSettings] = useState({
    allowRegistrations: true,
    requireApproval: true,
    autoPublish: false,
    emailNotifications: true,
    pushNotifications: true,
    maintenanceMode: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const SettingItem: React.FC<{
    icon: string;
    label: string;
    description?: string;
    value: boolean;
    onToggle: () => void;
  }> = ({ icon, label, description, value, onToggle }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon as any} size={20} color={COLORS.primary} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>{label}</Text>
          {description && (
            <Text style={styles.settingDescription}>{description}</Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.borderLight, true: COLORS.primary + '50' }}
        thumbColor={value ? COLORS.primary : COLORS.white}
      />
    </View>
  );

  const ActionItem: React.FC<{
    icon: string;
    label: string;
    color?: string;
    onPress: () => void;
  }> = ({ icon, label, color = COLORS.textPrimary, onPress }) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <Text style={[styles.settingLabel, { color }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEnglish ? 'Settings' : 'Paramètres'}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'User Management' : 'Gestion des utilisateurs'}
          </Text>
          <View style={styles.card}>
            <SettingItem
              icon="person-add"
              label={isEnglish ? 'Allow Registrations' : 'Autoriser les inscriptions'}
              description={isEnglish ? 'New users can create accounts' : 'Les nouveaux utilisateurs peuvent créer des comptes'}
              value={settings.allowRegistrations}
              onToggle={() => toggleSetting('allowRegistrations')}
            />
            <SettingItem
              icon="checkmark-circle"
              label={isEnglish ? 'Require Approval' : 'Approbation requise'}
              description={isEnglish ? 'New accounts need admin approval' : 'Les nouveaux comptes nécessitent une approbation'}
              value={settings.requireApproval}
              onToggle={() => toggleSetting('requireApproval')}
            />
          </View>
        </View>

        {/* Property Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'Properties' : 'Propriétés'}
          </Text>
          <View style={styles.card}>
            <SettingItem
              icon="flash"
              label={isEnglish ? 'Auto-Publish' : 'Publication automatique'}
              description={isEnglish ? 'Publish properties without review' : 'Publier les propriétés sans révision'}
              value={settings.autoPublish}
              onToggle={() => toggleSetting('autoPublish')}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'Notifications' : 'Notifications'}
          </Text>
          <View style={styles.card}>
            <SettingItem
              icon="mail"
              label={isEnglish ? 'Email Notifications' : 'Notifications par email'}
              value={settings.emailNotifications}
              onToggle={() => toggleSetting('emailNotifications')}
            />
            <SettingItem
              icon="notifications"
              label={isEnglish ? 'Push Notifications' : 'Notifications push'}
              value={settings.pushNotifications}
              onToggle={() => toggleSetting('pushNotifications')}
            />
          </View>
        </View>

        {/* System */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'System' : 'Système'}
          </Text>
          <View style={styles.card}>
            <SettingItem
              icon="construct"
              label={isEnglish ? 'Maintenance Mode' : 'Mode maintenance'}
              description={isEnglish ? 'Disable public access' : 'Désactiver l\'accès public'}
              value={settings.maintenanceMode}
              onToggle={() => toggleSetting('maintenanceMode')}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'Actions' : 'Actions'}
          </Text>
          <View style={styles.card}>
            <ActionItem
              icon="cloud-download"
              label={isEnglish ? 'Export Data' : 'Exporter les données'}
              onPress={() => Alert.alert(isEnglish ? 'Export' : 'Exportation', isEnglish ? 'Coming soon!' : 'Bientôt disponible!')}
            />
            <ActionItem
              icon="trash"
              label={isEnglish ? 'Clear Cache' : 'Vider le cache'}
              color={COLORS.warning}
              onPress={() => Alert.alert(isEnglish ? 'Cache cleared' : 'Cache vidé')}
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
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...SHADOWS.card,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  settingDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
});

export default AdminSettingsScreen;

