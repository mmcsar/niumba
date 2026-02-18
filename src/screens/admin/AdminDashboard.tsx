// Niumba - Admin Dashboard (RESTRICTED - Admins Only)
// Les utilisateurs non-admin n'ont PAS accès à ce dashboard
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import AccessDenied from '../../components/AccessDenied';
import LoginRequired from '../../components/LoginRequired';
import { createSampleProperties, checkSamplePropertiesExist, getSamplePropertiesCount } from '../../services/sampleDataService';
import { Alert, ActivityIndicator } from 'react-native';
import { errorLog } from '../../utils/logHelper';

interface AdminDashboardProps {
  navigation: any;
}

interface Stats {
  totalProperties: number;
  pendingProperties: number;
  activeProperties: number;
  totalUsers: number;
  totalAgents: number;
  pendingAgents: number;
  totalInquiries: number;
  newInquiries: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigation }) => {
  const { i18n, t } = useTranslation();
  const { user, profile, isAdmin, isEditor, signOut } = useAuth();
  
  // ========== SÉCURITÉ: Vérification des droits admin ==========
  // Si l'utilisateur n'est pas connecté
  if (!user) {
    return (
      <LoginRequired 
        navigation={navigation}
        icon="shield-checkmark"
        title={{ fr: 'Espace Administrateur', en: 'Admin Area' }}
        subtitle={{ 
          fr: 'Connectez-vous avec un compte administrateur pour accéder à cette zone.', 
          en: 'Sign in with an administrator account to access this area.' 
        }}
        showExplore={true}
      />
    );
  }
  
  // Si l'utilisateur est un éditeur, rediriger vers EditorDashboard
  if (isEditor && !isAdmin) {
    navigation.replace('EditorDashboard');
    return null;
  }
  
  // Si l'utilisateur est connecté mais n'est PAS admin
  if (!isAdmin) {
    return <AccessDenied navigation={navigation} />;
  }
  // =============================================================
  
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    pendingProperties: 0,
    activeProperties: 0,
    totalUsers: 0,
    totalAgents: 0,
    pendingAgents: 0,
    totalInquiries: 0,
    newInquiries: 0,
  });

  // Ensure stats is always defined
  const safeStats = stats || {
    totalProperties: 0,
    pendingProperties: 0,
    activeProperties: 0,
    totalUsers: 0,
    totalAgents: 0,
    pendingAgents: 0,
    totalInquiries: 0,
    newInquiries: 0,
  };
  const [refreshing, setRefreshing] = useState(false);
  const [creatingSampleData, setCreatingSampleData] = useState(false);
  const [sampleDataExists, setSampleDataExists] = useState(false);
  const isEnglish = i18n.language === 'en';

  const fetchStats = async () => {
    if (!isSupabaseConfigured()) {
      // Mock data for demo
      setStats({
        totalProperties: 156,
        pendingProperties: 12,
        activeProperties: 134,
        totalUsers: 89,
        totalAgents: 24,
        pendingAgents: 3,
        totalInquiries: 234,
        newInquiries: 8,
      });
      return;
    }

    try {
      // Fetch real stats from Supabase
      // Use Promise.allSettled to handle errors gracefully
      const queries = [
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('agents').select('id', { count: 'exact', head: true }),
        supabase.from('agents').select('id', { count: 'exact', head: true }).eq('is_verified', false),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      ];

      const results = await Promise.allSettled(queries);

      // Handle results with fallback to 0 if table doesn't exist
      const getCount = (result: PromiseSettledResult<any> | undefined) => {
        if (!result) return 0;
        if (result.status === 'fulfilled' && result.value && !result.value.error) {
          return result.value.count || 0;
        }
        // If table not found (PGRST205), return 0
        if (result.status === 'fulfilled' && result.value?.error?.code === 'PGRST205') {
          return 0;
        }
        return 0;
      };

      // Safely access results array with fallback
      // Ensure results array has at least 8 elements
      if (results && results.length >= 8) {
        setStats({
          totalProperties: getCount(results[0]) || 0,
          pendingProperties: getCount(results[1]) || 0,
          activeProperties: getCount(results[2]) || 0,
          totalUsers: getCount(results[3]) || 0,
          totalAgents: getCount(results[4]) || 0,
          pendingAgents: getCount(results[5]) || 0,
          totalInquiries: getCount(results[6]) || 0,
          newInquiries: getCount(results[7]) || 0,
        });
      } else {
        // If results array is incomplete, log error but don't crash
        errorLog('Incomplete results array in AdminDashboard fetchStats', new Error('Results array length mismatch'), { 
          expected: 8, 
          actual: results?.length || 0 
        });
        // Keep current stats on error (don't reset to 0)
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      errorLog('Error fetching stats in AdminDashboard', errorObj);
      // Keep current stats on error (don't reset to 0)
    }
  };

  useEffect(() => {
    fetchStats();
    checkSampleData();
  }, []);

  const checkSampleData = async () => {
    const exists = await checkSamplePropertiesExist();
    setSampleDataExists(exists);
  };

  const handleCreateSampleProperties = async () => {
    if (!user?.id) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'You must be logged in to create sample data.' : 'Vous devez être connecté pour créer des données d\'exemple.'
      );
      return;
    }

    Alert.alert(
      isEnglish ? 'Create Sample Properties' : 'Créer des propriétés d\'exemple',
      isEnglish 
        ? `This will create ${getSamplePropertiesCount() || 0} sample properties. Continue?`
        : `Cela créera ${getSamplePropertiesCount() || 0} propriétés d'exemple. Continuer ?`,
      [
        {
          text: isEnglish ? 'Cancel' : 'Annuler',
          style: 'cancel',
        },
        {
          text: isEnglish ? 'Create' : 'Créer',
          onPress: async () => {
            setCreatingSampleData(true);
            try {
              const result = await createSampleProperties(user.id);
              setCreatingSampleData(false);
              
              if (result && result.success > 0) {
                const successCount = result.success || 0;
                const errorCount = result.errors || 0;
                Alert.alert(
                  isEnglish ? 'Success' : 'Succès',
                  isEnglish
                    ? `Successfully created ${successCount} properties.${errorCount > 0 ? `\n${errorCount} errors occurred.` : ''}`
                    : `${successCount} propriétés créées avec succès.${errorCount > 0 ? `\n${errorCount} erreurs sont survenues.` : ''}`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        fetchStats();
                        checkSampleData();
                      },
                    },
                  ]
                );
              } else {
                const errorDetails = result.details && Array.isArray(result.details) 
                  ? result.details.join('\n') 
                  : (isEnglish ? 'Unknown error' : 'Erreur inconnue');
                Alert.alert(
                  isEnglish ? 'Error' : 'Erreur',
                  isEnglish
                    ? `Failed to create properties. ${errorDetails}`
                    : `Échec de la création des propriétés. ${errorDetails}`
                );
              }
            } catch (error) {
              setCreatingSampleData(false);
              const errorObj = error instanceof Error ? error : new Error(String(error));
              errorLog('Error creating sample properties in AdminDashboard', errorObj, { userId: user?.id });
              Alert.alert(
                isEnglish ? 'Error' : 'Erreur',
                error instanceof Error ? error.message : isEnglish ? 'An error occurred' : 'Une erreur est survenue'
              );
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const StatCard: React.FC<{
    icon: string;
    label: string;
    value: number;
    color: string;
    onPress?: () => void;
  }> = ({ icon, label, value, color, onPress }) => (
    <TouchableOpacity 
      style={styles.statCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const MenuItem: React.FC<{
    icon: string;
    label: string;
    badge?: number | null;
    onPress: () => void;
  }> = ({ icon, label, badge, onPress }) => {
    // Safely handle all props
    if (!icon || !label || !onPress) {
      return null;
    }

    // Safely handle badge value
    const badgeValue = badge !== undefined && badge !== null ? Number(badge) : 0;
    const showBadge = !isNaN(badgeValue) && badgeValue > 0;

    const handlePress = () => {
      try {
        if (onPress && typeof onPress === 'function') {
          onPress();
        }
      } catch (error) {
        errorLog('Error in MenuItem onPress', error instanceof Error ? error : new Error(String(error)), { icon, label });
      }
    };

    return (
      <TouchableOpacity style={styles.menuItem} onPress={handlePress} activeOpacity={0.7}>
        <View style={styles.menuItemLeft}>
          <View style={styles.menuItemIcon}>
            <Ionicons name={icon as any} size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.menuItemText}>{label || ''}</Text>
        </View>
        <View style={styles.menuItemRight}>
          {showBadge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badgeValue}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          {profile?.avatar_url ? (
            <Image 
              source={{ uri: profile.avatar_url }} 
              style={styles.profileAvatar} 
            />
          ) : (
            <View style={styles.profileAvatarPlaceholder}>
              <Ionicons name="person" size={20} color={COLORS.textPrimary} />
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>
            {isEnglish ? 'Admin Dashboard' : 'Tableau de bord Admin'}
          </Text>
          <Text style={styles.subtitle}>
            {profile?.full_name || 'Administrator'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('AdminNotifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
          {(safeStats.newInquiries || 0) > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{safeStats.newInquiries || 0}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="home"
            label={isEnglish ? 'Total Properties' : 'Total Propriétés'}
            value={safeStats.totalProperties}
            color={COLORS.primary}
            onPress={() => navigation.navigate('AdminProperties')}
          />
          <StatCard
            icon="time"
            label={isEnglish ? 'Pending' : 'En attente'}
            value={safeStats.pendingProperties}
            color="#FF9500"
            onPress={() => navigation.navigate('AdminProperties', { filter: 'pending' })}
          />
          <StatCard
            icon="checkmark-circle"
            label={isEnglish ? 'Active' : 'Actifs'}
            value={safeStats.activeProperties}
            color="#00A86B"
          />
          <StatCard
            icon="people"
            label={isEnglish ? 'Users' : 'Utilisateurs'}
            value={safeStats.totalUsers}
            color="#5856D6"
            onPress={() => navigation.navigate('AdminUsers')}
          />
          <StatCard
            icon="briefcase"
            label={isEnglish ? 'Agents' : 'Agents'}
            value={safeStats.totalAgents}
            color="#007AFF"
            onPress={() => navigation.navigate('AdminAgents')}
          />
          <StatCard
            icon="mail"
            label={isEnglish ? 'Inquiries' : 'Demandes'}
            value={safeStats.totalInquiries}
            color="#E4002B"
            onPress={() => navigation.navigate('AdminInquiries')}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'Quick Actions' : 'Actions rapides'}
          </Text>
          
          <View style={styles.menuCard}>
            <MenuItem
              icon="add-circle"
              label={isEnglish ? 'Add Property' : 'Ajouter une propriété'}
              onPress={() => navigation.navigate('AdminAddProperty')}
            />
            <MenuItem
              icon="home"
              label={isEnglish ? 'Manage Properties' : 'Gérer les propriétés'}
              badge={safeStats.pendingProperties || 0}
              onPress={() => navigation.navigate('AdminProperties')}
            />
            <MenuItem
              icon="people"
              label={isEnglish ? 'Manage Users' : 'Gérer les utilisateurs'}
              onPress={() => navigation.navigate('AdminUsers')}
            />
            <MenuItem
              icon="briefcase"
              label={isEnglish ? 'Manage Agents' : 'Gérer les agents'}
              badge={safeStats.pendingAgents || 0}
              onPress={() => navigation.navigate('AdminAgents')}
            />
            <MenuItem
              icon="person-add"
              label={isEnglish ? 'Add New Agent' : 'Ajouter un agent'}
              onPress={() => navigation.navigate('AdminAgents', { showAddModal: true })}
            />
            <MenuItem
              icon="chatbubbles"
              label={isEnglish ? 'Inquiries' : 'Demandes'}
              badge={safeStats.newInquiries || 0}
              onPress={() => navigation.navigate('AdminInquiries')}
            />
            <MenuItem
              icon="calendar"
              label={isEnglish ? 'Appointments' : 'Rendez-vous'}
              onPress={() => navigation.navigate('AdminAppointments')}
            />
          </View>
        </View>

        {/* Development Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'Development Tools' : 'Outils de développement'}
          </Text>
          
          <View style={styles.menuCard}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handleCreateSampleProperties}
              disabled={creatingSampleData}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIcon}>
                  {creatingSampleData ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <Ionicons name="sparkles" size={22} color={COLORS.primary} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuItemText}>
                    {isEnglish ? 'Create Sample Properties' : 'Créer des propriétés d\'exemple'}
                  </Text>
                  <Text style={styles.menuItemSubtext}>
                    {isEnglish 
                      ? `${getSamplePropertiesCount() || 0} properties will be created`
                      : `${getSamplePropertiesCount() || 0} propriétés seront créées`}
                  </Text>
                </View>
              </View>
              <View style={styles.menuItemRight}>
                {sampleDataExists && (
                  <View style={[styles.badge, { backgroundColor: '#00A86B' }]}>
                    <Text style={styles.badgeText}>
                      {isEnglish ? 'Exists' : 'Existe'}
                    </Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'Settings' : 'Paramètres'}
          </Text>
          
          <View style={styles.menuCard}>
            <MenuItem
              icon="analytics"
              label={isEnglish ? 'Analytics' : 'Analytiques'}
              onPress={() => navigation.navigate('AdminAnalytics')}
            />
            <MenuItem
              icon="notifications"
              label={isEnglish ? 'Push Notifications' : 'Notifications push'}
              onPress={() => navigation.navigate('AdminNotificationSettings')}
            />
            <MenuItem
              icon="settings"
              label={isEnglish ? 'App Settings' : 'Paramètres de l\'app'}
              onPress={() => navigation.navigate('AdminSettings')}
            />
            <MenuItem
              icon="document-text"
              label={isEnglish ? 'Activity Logs' : 'Journaux d\'activité'}
              onPress={() => navigation.navigate('AdminActivityLog')}
            />
            <MenuItem
              icon="shield-checkmark"
              label={isEnglish ? 'Privacy Policy' : 'Politique de confidentialité'}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            signOut();
            navigation.replace('MainTabs');
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>
            {isEnglish ? 'Sign Out' : 'Déconnexion'}
          </Text>
        </TouchableOpacity>

        {/* Exit Admin */}
        <TouchableOpacity 
          style={styles.exitButton}
          onPress={() => navigation.replace('MainTabs')}
        >
          <Text style={styles.exitText}>
            {isEnglish ? '← Back to App' : '← Retour à l\'app'}
          </Text>
        </TouchableOpacity>

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 12,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  profileAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.error,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.card,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: SIZES.screenPadding,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  menuItemSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SIZES.screenPadding,
    marginTop: 32,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    fontSize: 16,
    color: COLORS.error,
    fontWeight: '600',
    marginLeft: 8,
  },
  exitButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  exitText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default AdminDashboard;

