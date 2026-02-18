// Niumba - Profile Screen with Admin Access
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { changeLanguage } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';

interface ProfileScreenProps {
  navigation: any;
}

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  rightElement,
  danger = false,
}) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    disabled={!onPress && !rightElement}
    activeOpacity={0.7}
  >
    <View style={[styles.menuItemIcon, danger && styles.menuItemIconDanger]}>
      <Ionicons name={icon as any} size={22} color={danger ? COLORS.error : COLORS.primary} />
    </View>
    <View style={styles.menuItemContent}>
      <Text style={[styles.menuItemTitle, danger && styles.menuItemTitleDanger]}>{title}</Text>
      {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
    </View>
    {rightElement}
    {showArrow && !rightElement && (
      <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
    )}
  </TouchableOpacity>
);

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const { user, profile, isAdmin, isEditor, isOwner, signOut, isConfigured } = useAuth();
  const { isOnline, lastSyncTime, cachedPropertiesCount, clearCache } = useOffline();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const isEnglish = i18n.language === 'en';
  const isLoggedIn = !!user;

  const toggleLanguage = () => {
    changeLanguage(isEnglish ? 'fr' : 'en');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleClearCache = () => {
    Alert.alert(
      isEnglish ? 'Clear Cache' : 'Vider le cache',
      isEnglish 
        ? 'This will delete all cached properties. You will need internet to reload them.'
        : 'Ceci supprimera toutes les propriétés en cache. Vous aurez besoin d\'internet pour les recharger.',
      [
        { text: isEnglish ? 'Cancel' : 'Annuler', style: 'cancel' },
        { 
          text: isEnglish ? 'Clear' : 'Vider', 
          style: 'destructive',
          onPress: async () => {
            await clearCache();
            Alert.alert(
              isEnglish ? 'Done' : 'Terminé',
              isEnglish ? 'Cache cleared successfully' : 'Cache vidé avec succès'
            );
          }
        },
      ]
    );
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return isEnglish ? 'Never' : 'Jamais';
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 1) return isEnglish ? 'Just now' : 'À l\'instant';
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours}h`;
    return lastSyncTime.toLocaleDateString();
  };

  const handleLogout = async () => {
    Alert.alert(
      isEnglish ? 'Sign Out' : 'Déconnexion',
      isEnglish ? 'Are you sure you want to sign out?' : 'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: isEnglish ? 'Cancel' : 'Annuler', style: 'cancel' },
        {
          text: isEnglish ? 'Sign Out' : 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  // Accès admin/editor - Redirection selon le rôle
  const handleAdminAccess = () => {
    if (isAdmin) {
      navigation.navigate('AdminDashboard');
    } else if (isEditor) {
      navigation.navigate('EditorDashboard');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isEnglish ? 'Profile' : 'Profil'}
          </Text>
        </View>

        {/* User Card */}
        {isLoggedIn ? (
          <View style={styles.userCard}>
            <Image
              source={{ 
                uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
              }}
              style={styles.userAvatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {profile?.full_name || user.email?.split('@')[0]}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              {(isAdmin || isOwner) && (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>
                    {isAdmin ? 'Admin' : (isEnglish ? 'Owner' : 'Propriétaire')}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Ionicons name="pencil" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.guestCard}>
            <View style={styles.guestAvatar}>
              <Ionicons name="person" size={40} color={COLORS.textLight} />
            </View>
            <View style={styles.guestInfo}>
              <Text style={styles.guestTitle}>
                {isEnglish ? 'Welcome to Niumba' : 'Bienvenue sur Niumba'}
              </Text>
              <Text style={styles.guestSubtitle}>
                {isEnglish 
                  ? 'Sign in to save homes and more' 
                  : 'Connectez-vous pour sauvegarder des biens'}
              </Text>
            </View>
          </View>
        )}

        {/* Auth Buttons for guests */}
        {!isLoggedIn && (
          <View style={styles.authButtons}>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
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
          </View>
        )}

        {/* Admin/Editor Access */}
        {(isAdmin || isEditor) && (
          <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>
              {isAdmin ? 'ADMIN' : 'EDITOR'}
            </Text>
            <MenuItem
              icon="shield-checkmark"
              title={isAdmin 
                ? (isEnglish ? 'Admin Dashboard' : 'Tableau de bord Admin')
                : (isEnglish ? 'Editor Dashboard' : 'Tableau de bord Éditeur')}
              onPress={handleAdminAccess}
            />
          </View>
        )}

        {/* Owner Access */}
        {isOwner && !isAdmin && (
          <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>
              {isEnglish ? 'MY PROPERTIES' : 'MES PROPRIÉTÉS'}
            </Text>
            <MenuItem
              icon="home"
              title={isEnglish ? 'My Listings' : 'Mes annonces'}
              onPress={() => navigation.navigate('MyProperties')}
            />
            <MenuItem
              icon="add-circle"
              title={isEnglish ? 'Add Property' : 'Ajouter une propriété'}
              onPress={() => navigation.navigate('AddProperty')}
            />
            <MenuItem
              icon="chatbubbles"
              title={isEnglish ? 'Inquiries' : 'Demandes reçues'}
              onPress={() => navigation.navigate('MyInquiries')}
            />
          </View>
        )}

        {/* Settings Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>
            {isEnglish ? 'SETTINGS' : 'PARAMÈTRES'}
          </Text>
          
          <MenuItem
            icon="language"
            title={isEnglish ? 'Language' : 'Langue'}
            subtitle={isEnglish ? 'English' : 'Français'}
            onPress={toggleLanguage}
          />
          
          <MenuItem
            icon="notifications"
            title={isEnglish ? 'Notifications' : 'Notifications'}
            showArrow={false}
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            }
          />

          <MenuItem
            icon="notifications-outline"
            title={isEnglish ? 'Property Alerts' : 'Alertes propriétés'}
            subtitle={isEnglish ? 'Get notified for new properties' : 'Recevez des alertes pour nouvelles propriétés'}
            onPress={() => navigation.navigate('Alerts')}
          />

          <MenuItem
            icon="chatbubbles-outline"
            title={isEnglish ? 'Messages' : 'Messages'}
            subtitle={isEnglish ? 'Your conversations' : 'Vos conversations'}
            onPress={() => navigation.navigate('Conversations')}
          />
        </View>

        {/* Offline Mode Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>
            {isEnglish ? 'OFFLINE MODE' : 'MODE HORS-LIGNE'}
          </Text>

          <View style={styles.offlineStatus}>
            <View style={styles.offlineStatusRow}>
              <Ionicons 
                name={isOnline ? 'cloud-done' : 'cloud-offline'} 
                size={24} 
                color={isOnline ? COLORS.success : COLORS.warning} 
              />
              <View style={styles.offlineStatusText}>
                <Text style={styles.offlineStatusTitle}>
                  {isOnline 
                    ? (isEnglish ? 'Online' : 'En ligne')
                    : (isEnglish ? 'Offline' : 'Hors ligne')}
                </Text>
                <Text style={styles.offlineStatusSubtitle}>
                  {isEnglish ? 'Last sync: ' : 'Dernière sync: '}{formatLastSync()}
                </Text>
              </View>
            </View>
            <View style={styles.cacheInfo}>
              <Ionicons name="folder" size={18} color={COLORS.textSecondary} />
              <Text style={styles.cacheInfoText}>
                {cachedPropertiesCount} {isEnglish ? 'properties cached' : 'propriétés en cache'}
              </Text>
            </View>
          </View>

          <MenuItem
            icon="trash-outline"
            title={isEnglish ? 'Clear Cache' : 'Vider le cache'}
            subtitle={isEnglish ? 'Free up storage space' : 'Libérer de l\'espace'}
            onPress={handleClearCache}
          />
        </View>

        {/* Support Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>
            {isEnglish ? 'SUPPORT' : 'ASSISTANCE'}
          </Text>
          
          <MenuItem
            icon="business"
            title={isEnglish ? 'About MMC SARL' : 'À propos de MMC SARL'}
            subtitle={isEnglish ? 'Contact & company info' : 'Contact & infos entreprise'}
            onPress={() => navigation.navigate('Support')}
          />
          
          <MenuItem
            icon="help-circle"
            title={isEnglish ? 'Help Center' : 'Centre d\'aide'}
            onPress={() => navigation.navigate('Support')}
          />
          
          <MenuItem
            icon="mail"
            title={isEnglish ? 'Contact Us' : 'Nous contacter'}
            subtitle="mmc@maintenancemc.com"
            onPress={() => navigation.navigate('Support')}
          />
          
          <MenuItem
            icon="document-text"
            title={isEnglish ? 'Terms of Service' : 'Conditions d\'utilisation'}
            onPress={() => {}}
          />
          
          <MenuItem
            icon="shield-checkmark"
            title={isEnglish ? 'Privacy Policy' : 'Politique de confidentialité'}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
        </View>

        {/* Logout (if logged in) */}
        {isLoggedIn && (
          <View style={styles.menuSection}>
            <MenuItem
              icon="log-out"
              title={isEnglish ? 'Sign Out' : 'Déconnexion'}
              onPress={handleLogout}
              showArrow={false}
              danger
            />
          </View>
        )}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Niumba - Real Estate B2B</Text>
          <Text style={styles.appInfoText}>Haut-Katanga & Lualaba, RDC</Text>
          <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
          <Text style={[styles.appInfoText, { marginTop: 8 }]}>© 2026 MMC SARL</Text>
          {!isConfigured && (
            <Text style={styles.demoText}>Mode Démo (Supabase non configuré)</Text>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 120 }} />
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
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.screenPadding,
    marginTop: 20,
    borderRadius: SIZES.radiusLarge,
    padding: 16,
    ...SHADOWS.card,
  },
  userAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  editButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.screenPadding,
    marginTop: 20,
    borderRadius: SIZES.radiusLarge,
    padding: 20,
    ...SHADOWS.card,
  },
  guestAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestInfo: {
    flex: 1,
    marginLeft: 16,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  guestSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  authButtons: {
    paddingHorizontal: SIZES.screenPadding,
    marginTop: 16,
    marginBottom: 8,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: COLORS.white,
    height: 52,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  registerButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  menuSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.screenPadding,
    marginTop: 20,
    borderRadius: SIZES.radiusLarge,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemIconDanger: {
    backgroundColor: '#FFE8EC',
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemTitle: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  menuItemTitleDanger: {
    color: COLORS.error,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: SIZES.screenPadding,
  },
  appInfoText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  appInfoVersion: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  demoText: {
    fontSize: 11,
    color: COLORS.warning,
    marginTop: 8,
    fontStyle: 'italic',
  },
  offlineStatus: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  offlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineStatusText: {
    marginLeft: 12,
  },
  offlineStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  offlineStatusSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cacheInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  cacheInfoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
});

export default ProfileScreen;
