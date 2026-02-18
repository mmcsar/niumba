// Niumba - Editor Dashboard
// Dashboard simplifié pour les éditeurs (peuvent publier/modifier des propriétés)
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getUserActivityLogs } from '../../services/activityLogService';
import { errorLog } from '../../utils/logHelper';

interface EditorDashboardProps {
  navigation: any;
}

interface Stats {
  myProperties: number;
  activeProperties: number;
  pendingProperties: number;
  recentActivities: number;
}

const EditorDashboard: React.FC<EditorDashboardProps> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const { user, profile, isEditor, signOut } = useAuth();
  const isEnglish = i18n.language === 'en';

  const [stats, setStats] = useState<Stats>({
    myProperties: 0,
    activeProperties: 0,
    pendingProperties: 0,
    recentActivities: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user && isEditor) {
      fetchStats();
    }
  }, [user, isEditor]);

  const fetchStats = async () => {
    if (!isSupabaseConfigured() || !user) return;

    try {
      // Get my properties count
      const { count: totalCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id);

      // Get active properties
      const { count: activeCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .eq('status', 'active');

      // Get pending properties
      const { count: pendingCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .eq('status', 'pending');

      // Get recent activities (last 24 hours)
      const { data: activities } = await getUserActivityLogs(user.id, 0, 1);
      const recentCount = activities?.filter(activity => {
        const activityDate = new Date(activity.created_at || '');
        const now = new Date();
        const diffHours = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60);
        return diffHours <= 24;
      }).length || 0;

      setStats({
        myProperties: totalCount || 0,
        activeProperties: activeCount || 0,
        pendingProperties: pendingCount || 0,
        recentActivities: recentCount,
      });
    } catch (error) {
      errorLog('Error fetching editor stats', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
  };

  // Security check
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isEditor) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDeniedContainer}>
          <Ionicons name="lock-closed" size={64} color={COLORS.error} />
          <Text style={styles.accessDeniedText}>
            {isEnglish ? 'Access Denied' : 'Accès Refusé'}
          </Text>
          <Text style={styles.accessDeniedSubtext}>
            {isEnglish 
              ? 'This area is for editors only.' 
              : 'Cette zone est réservée aux éditeurs.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
    onPress: () => void;
  }> = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuItemIcon}>
          <Ionicons name={icon as any} size={22} color={COLORS.primary} />
        </View>
        <Text style={styles.menuItemText}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );

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
            {isEnglish ? 'Editor Dashboard' : 'Tableau de bord Éditeur'}
          </Text>
          <Text style={styles.subtitle}>
            {profile?.full_name || 'Editor'}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
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
              label={isEnglish ? 'My Properties' : 'Mes Propriétés'}
              value={stats.myProperties}
              color={COLORS.primary}
              onPress={() => navigation.navigate('MyProperties')}
            />
            <StatCard
              icon="checkmark-circle"
              label={isEnglish ? 'Active' : 'Actives'}
              value={stats.activeProperties}
              color="#00A86B"
            />
            <StatCard
              icon="time"
              label={isEnglish ? 'Pending' : 'En attente'}
              value={stats.pendingProperties}
              color="#FF9500"
            />
            <StatCard
              icon="activity"
              label={isEnglish ? 'Activities' : 'Activités'}
              value={stats.recentActivities}
              color={COLORS.primary}
            />
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isEnglish ? 'Actions' : 'Actions'}
            </Text>
            
            <View style={styles.menuCard}>
              <MenuItem
                icon="add-circle"
                label={isEnglish ? 'Add Property' : 'Ajouter une propriété'}
                onPress={() => navigation.navigate('AdminAddProperty')}
              />
              <MenuItem
                icon="home"
                label={isEnglish ? 'My Properties' : 'Mes propriétés'}
                onPress={() => navigation.navigate('MyProperties')}
              />
              <MenuItem
                icon="list"
                label={isEnglish ? 'My Activities' : 'Mes activités'}
                onPress={() => navigation.navigate('MyActivities')}
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

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding * 2,
  },
  accessDeniedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.error,
    marginTop: 24,
    marginBottom: 8,
  },
  accessDeniedSubtext: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
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
});

export default EditorDashboard;

