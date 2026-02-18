// Niumba - Admin Activity Log Screen
// Permet à l'admin de surveiller les activités des éditeurs
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { getActivityLogs, ActivityLog } from '../../services/activityLogService';
import { errorLog } from '../../utils/logHelper';

interface AdminActivityLogScreenProps {
  navigation: any;
}

const AdminActivityLogScreen: React.FC<AdminActivityLogScreenProps> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const { isAdmin } = useAuth();
  const isEnglish = i18n.language === 'en';

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'create' | 'update' | 'delete' | 'publish' | 'unpublish'>('all');
  const [resourceFilter, setResourceFilter] = useState<'all' | 'property' | 'agent' | 'user' | 'appointment'>('all');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAdmin) {
      loadLogs();
    }
  }, [isAdmin, filter, resourceFilter]);

  const loadLogs = async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const result = await getActivityLogs({
        action: filter !== 'all' ? filter : undefined,
        resourceType: resourceFilter !== 'all' ? resourceFilter : undefined,
        page: 0,
        pageSize: 100,
      });
      setLogs(result.data || []);
    } catch (error) {
      errorLog('Error loading activity logs', error instanceof Error ? error : new Error(String(error)));
      setLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return 'add-circle';
      case 'update':
        return 'pencil';
      case 'delete':
        return 'trash';
      case 'publish':
        return 'checkmark-circle';
      case 'unpublish':
        return 'close-circle';
      default:
        return 'ellipse';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return '#00A86B';
      case 'update':
        return COLORS.primary;
      case 'delete':
        return COLORS.error;
      case 'publish':
        return '#00A86B';
      case 'unpublish':
        return '#FF9500';
      default:
        return COLORS.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return isEnglish ? 'Just now' : 'À l\'instant';
    if (diffMins < 60) return `${diffMins} ${isEnglish ? 'min ago' : 'min'}`;
    if (diffHours < 24) return `${diffHours} ${isEnglish ? 'hours ago' : 'h'}`;
    if (diffDays < 7) return `${diffDays} ${isEnglish ? 'days ago' : 'j'}`;
    return date.toLocaleDateString();
  };

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const renderLogItem = ({ item }: { item: ActivityLog }) => {
    if (!item || !item.id) return null;

    const logId = item.id || `${item.user_id}-${item.created_at}`;
    const isExpanded = expandedLogs.has(logId);

    // Safely parse details if it's a string
    let details: Record<string, any> = {};
    if (item.details) {
      if (typeof item.details === 'string') {
        try {
          details = JSON.parse(item.details);
        } catch {
          details = {};
        }
      } else if (typeof item.details === 'object') {
        details = item.details;
      }
    }

    const hasDetails = details && Object.keys(details).length > 0;

    return (
      <TouchableOpacity
        style={styles.logItem}
        onPress={() => hasDetails && toggleLogExpansion(logId)}
        activeOpacity={hasDetails ? 0.7 : 1}
      >
        <View style={[styles.logIcon, { backgroundColor: getActionColor(item.action) + '20' }]}>
          <Ionicons 
            name={getActionIcon(item.action) as any} 
            size={20} 
            color={getActionColor(item.action)} 
          />
        </View>
        <View style={styles.logContent}>
          <View style={styles.logHeader}>
            <View style={styles.logUserInfo}>
              <Text style={styles.logUserName}>{item.user_name || 'Unknown'}</Text>
              <View style={[styles.roleBadge, { backgroundColor: item.user_role === 'editor' ? '#007AFF20' : '#5856D620' }]}>
                <Text style={[styles.roleBadgeText, { color: item.user_role === 'editor' ? '#007AFF' : '#5856D6' }]}>
                  {item.user_role || 'user'}
                </Text>
              </View>
            </View>
            <Text style={styles.logDate}>{formatDate(item.created_at || new Date().toISOString())}</Text>
          </View>
          <Text style={styles.logAction}>
            {item.action === 'create' && (isEnglish ? 'Created' : 'Créé')}
            {item.action === 'update' && (isEnglish ? 'Updated' : 'Modifié')}
            {item.action === 'delete' && (isEnglish ? 'Deleted' : 'Supprimé')}
            {item.action === 'publish' && (isEnglish ? 'Published' : 'Publié')}
            {item.action === 'unpublish' && (isEnglish ? 'Unpublished' : 'Dépublié')}
            {' '}
            <Text style={styles.logResourceType}>
              {item.resource_type === 'property' && (isEnglish ? 'property' : 'propriété')}
              {item.resource_type === 'agent' && (isEnglish ? 'agent' : 'agent')}
              {item.resource_type === 'user' && (isEnglish ? 'user' : 'utilisateur')}
              {item.resource_type === 'appointment' && (isEnglish ? 'appointment' : 'rendez-vous')}
            </Text>
          </Text>
          {item.resource_name && (
            <Text style={styles.logResourceName}>{item.resource_name}</Text>
          )}
          {item.resource_id && (
            <Text style={styles.logResourceId}>ID: {item.resource_id}</Text>
          )}
          {hasDetails && (
            <View style={styles.detailsContainer}>
              {isExpanded ? (
                <>
                  {Object.entries(details).map(([key, value]) => (
                    <View key={key} style={styles.detailItem}>
                      <Text style={styles.detailKey}>{key}:</Text>
                      <Text style={styles.detailValue}>
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </Text>
                    </View>
                  ))}
                  {hasDetails && (
                    <TouchableOpacity onPress={() => toggleLogExpansion(logId)} style={styles.expandButton}>
                      <Text style={styles.expandButtonText}>
                        {isEnglish ? 'Show less' : 'Afficher moins'}
                      </Text>
                      <Ionicons name="chevron-up" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <TouchableOpacity onPress={() => toggleLogExpansion(logId)} style={styles.expandButton}>
                  <Text style={styles.expandButtonText}>
                    {isEnglish ? 'Show details' : 'Afficher les détails'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDeniedContainer}>
          <Ionicons name="lock-closed" size={64} color={COLORS.error} />
          <Text style={styles.accessDeniedText}>
            {isEnglish ? 'Access Denied' : 'Accès Refusé'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEnglish ? 'Activity Logs' : 'Journaux d\'activité'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <View style={styles.filters}>
          <Text style={styles.filterLabel}>{isEnglish ? 'Action:' : 'Action:'}</Text>
          {(['all', 'create', 'update', 'delete', 'publish', 'unpublish'] as const).map((filterType) => (
            <TouchableOpacity
              key={filterType}
              style={[
                styles.filterButton,
                filter === filterType && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(filterType)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === filterType && styles.filterButtonTextActive,
                ]}
              >
                {filterType === 'all' && (isEnglish ? 'All' : 'Tout')}
                {filterType === 'create' && (isEnglish ? 'Created' : 'Créations')}
                {filterType === 'update' && (isEnglish ? 'Updated' : 'Modifications')}
                {filterType === 'delete' && (isEnglish ? 'Deleted' : 'Suppressions')}
                {filterType === 'publish' && (isEnglish ? 'Published' : 'Publications')}
                {filterType === 'unpublish' && (isEnglish ? 'Unpublished' : 'Dépublications')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.filters}>
          <Text style={styles.filterLabel}>{isEnglish ? 'Resource:' : 'Ressource:'}</Text>
          {(['all', 'property', 'agent', 'user', 'appointment'] as const).map((resourceType) => (
            <TouchableOpacity
              key={resourceType}
              style={[
                styles.filterButton,
                resourceFilter === resourceType && styles.filterButtonActive,
              ]}
              onPress={() => setResourceFilter(resourceType)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  resourceFilter === resourceType && styles.filterButtonTextActive,
                ]}
              >
                {resourceType === 'all' && (isEnglish ? 'All' : 'Tout')}
                {resourceType === 'property' && (isEnglish ? 'Properties' : 'Propriétés')}
                {resourceType === 'agent' && (isEnglish ? 'Agents' : 'Agents')}
                {resourceType === 'user' && (isEnglish ? 'Users' : 'Utilisateurs')}
                {resourceType === 'appointment' && (isEnglish ? 'Appointments' : 'Rendez-vous')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={logs}
          renderItem={renderLogItem}
          keyExtractor={(item) => item.id || `${item.user_id}-${item.created_at}`}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyText}>
                {isEnglish ? 'No activities found' : 'Aucune activité trouvée'}
              </Text>
            </View>
          }
        />
      )}
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
  filtersContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  filtersContent: {
    paddingVertical: 12,
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
    marginBottom: 8,
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.background,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: COLORS.white,
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
  },
  accessDeniedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.error,
    marginTop: 24,
  },
  listContent: {
    padding: SIZES.screenPadding,
  },
  logItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logContent: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  logDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  logAction: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  logResourceType: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  logResourceName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  logResourceId: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  detailsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  detailItem: {
    marginTop: 6,
    paddingLeft: 8,
  },
  detailKey: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: 4,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 8,
    gap: 4,
  },
  expandButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 16,
  },
});

export default AdminActivityLogScreen;

