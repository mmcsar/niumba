// Niumba - Admin Properties Management
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Property, PropertyStatus } from '../../types/database';
import { useProperties } from '../../hooks/useProperties';
import { useAuth } from '../../context/AuthContext';
import { bulkUpdateStatus, bulkDeleteProperties, bulkPublishProperties, bulkUnpublishProperties } from '../../services/propertyService';
import { logActivity } from '../../services/activityLogService';
import { errorLog } from '../../utils/logHelper';

interface AdminPropertiesScreenProps {
  navigation: any;
  route?: {
    params?: {
      filter?: PropertyStatus;
    };
  };
}

const AdminPropertiesScreen: React.FC<AdminPropertiesScreenProps> = ({ navigation, route }) => {
  const { i18n } = useTranslation();
  const { isAdmin } = useAuth();
  const [filter, setFilter] = useState<PropertyStatus | 'all'>(route?.params?.filter || 'all');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  const isEnglish = i18n.language === 'en';

  // Use hook for properties
  const { properties: hookProperties, loading, error, refresh } = useProperties({
    filters: filter !== 'all' ? { status: filter as any } : undefined,
    pageSize: 50, // Load more for admin
  });

  // Transform hook properties to match screen format
  const allProperties = hookProperties.map((prop: any) => ({
    ...prop,
    owner: prop.owner || { full_name: 'Unknown', email: '' },
    referenceNumber: prop.id.substring(0, 8).toUpperCase(), // NF (Numéro de Référence)
  }));

  // Filter properties by search query (NF, title, owner name, address)
  const filteredProperties = searchQuery
    ? allProperties.filter((prop: any) => {
        const query = searchQuery.toLowerCase();
        return (
          prop.referenceNumber.toLowerCase().includes(query) ||
          prop.title?.toLowerCase().includes(query) ||
          prop.title_en?.toLowerCase().includes(query) ||
          prop.owner?.full_name?.toLowerCase().includes(query) ||
          prop.address?.toLowerCase().includes(query) ||
          prop.city?.toLowerCase().includes(query)
        );
      })
    : allProperties;

  // Show selected properties if any
  const properties = selectedProperties.size > 0
    ? filteredProperties.filter((prop: any) => selectedProperties.has(prop.id))
    : filteredProperties;

  useEffect(() => {
    if (route?.params?.filter && route.params.filter !== filter) {
      setFilter(route.params.filter);
    }
  }, [route?.params?.filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleStatusChange = async (propertyId: string, newStatus: PropertyStatus) => {
    if (!isSupabaseConfigured()) {
      Alert.alert('Demo', 'Cette fonctionnalité nécessite Supabase');
      return;
    }

    try {
      // @ts-ignore - TypeScript issue with Supabase update types
      const { error } = await (supabase
        .from('properties') as any)
        .update({ 
          status: newStatus,
          published_at: newStatus === 'active' ? new Date().toISOString() : null
        } as any)
        .eq('id', propertyId);

      if (error) throw error;
      
      Alert.alert(
        isEnglish ? 'Success' : 'Succès',
        isEnglish ? 'Property status updated' : 'Statut de la propriété mis à jour'
      );
      refresh();
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert(isEnglish ? 'Error' : 'Erreur', 'Failed to update status');
    }
  };

  const handleDelete = (propertyId: string) => {
    Alert.alert(
      isEnglish ? 'Delete Property' : 'Supprimer la propriété',
      isEnglish ? 'Are you sure you want to delete this property?' : 'Êtes-vous sûr de vouloir supprimer cette propriété ?',
      [
        { text: isEnglish ? 'Cancel' : 'Annuler', style: 'cancel' },
        { 
          text: isEnglish ? 'Delete' : 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            if (!isSupabaseConfigured()) return;
            
            try {
              const { error } = await supabase
                .from('properties')
                .delete()
                .eq('id', propertyId);
              
              if (error) throw error;
              refresh();
            } catch (error) {
              errorLog('Error deleting property', error instanceof Error ? error : new Error(String(error)));
            }
          }
        },
      ]
    );
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedProperties.size === 0) return;

    const propertyIds = Array.from(selectedProperties);
    const count = propertyIds.length;

    let confirmMessage = '';
    let confirmTitle = '';

    switch (action) {
      case 'publish':
        confirmTitle = isEnglish ? 'Publish Properties' : 'Publier les propriétés';
        confirmMessage = isEnglish 
          ? `Publish ${count} property(ies)?`
          : `Publier ${count} propriété(s) ?`;
        break;
      case 'unpublish':
        confirmTitle = isEnglish ? 'Unpublish Properties' : 'Dépublier les propriétés';
        confirmMessage = isEnglish 
          ? `Unpublish ${count} property(ies)?`
          : `Dépublier ${count} propriété(s) ?`;
        break;
      case 'delete':
        confirmTitle = isEnglish ? 'Delete Properties' : 'Supprimer les propriétés';
        confirmMessage = isEnglish 
          ? `Delete ${count} property(ies)? This action cannot be undone.`
          : `Supprimer ${count} propriété(s) ? Cette action est irréversible.`;
        break;
    }

    Alert.alert(
      confirmTitle,
      confirmMessage,
      [
        { text: isEnglish ? 'Cancel' : 'Annuler', style: 'cancel' },
        {
          text: isEnglish ? 'Confirm' : 'Confirmer',
          style: action === 'delete' ? 'destructive' : 'default',
          onPress: async () => {
            setBulkActionLoading(true);
            try {
              const userResponse = await supabase.auth.getUser();
              const currentUser = userResponse.data.user;
              let result: { success: number; failed: number };

              switch (action) {
                case 'publish':
                  result = await bulkPublishProperties(propertyIds);
                  if (result.success > 0 && currentUser) {
                    await logActivity({
                      user_id: currentUser.id,
                      user_name: currentUser.email || 'Admin',
                      user_role: 'admin',
                      action: 'publish',
                      resource_type: 'property',
                      resource_id: propertyIds.join(','),
                      resource_name: `${result.success} properties`,
                      details: { count: result.success, action: 'bulk_publish' },
                    });
                  }
                  break;
                case 'unpublish':
                  result = await bulkUnpublishProperties(propertyIds);
                  if (result.success > 0 && currentUser) {
                    await logActivity({
                      user_id: currentUser.id,
                      user_name: currentUser.email || 'Admin',
                      user_role: 'admin',
                      action: 'unpublish',
                      resource_type: 'property',
                      resource_id: propertyIds.join(','),
                      resource_name: `${result.success} properties`,
                      details: { count: result.success, action: 'bulk_unpublish' },
                    });
                  }
                  break;
                case 'delete':
                  result = await bulkDeleteProperties(propertyIds);
                  if (result.success > 0 && currentUser) {
                    await logActivity({
                      user_id: currentUser.id,
                      user_name: currentUser.email || 'Admin',
                      user_role: 'admin',
                      action: 'delete',
                      resource_type: 'property',
                      resource_id: propertyIds.join(','),
                      resource_name: `${result.success} properties`,
                      details: { count: result.success, action: 'bulk_delete' },
                    });
                  }
                  break;
              }

              Alert.alert(
                isEnglish ? 'Success' : 'Succès',
                isEnglish 
                  ? `${result.success} property(ies) ${action === 'publish' ? 'published' : action === 'unpublish' ? 'unpublished' : 'deleted'} successfully`
                  : `${result.success} propriété(s) ${action === 'publish' ? 'publiée(s)' : action === 'unpublish' ? 'dépubliée(s)' : 'supprimée(s)'} avec succès`
              );

              setSelectedProperties(new Set());
              setShowBulkActions(false);
              refresh();
            } catch (error) {
              errorLog('Error performing bulk action', error instanceof Error ? error : new Error(String(error)));
              Alert.alert(
                isEnglish ? 'Error' : 'Erreur',
                isEnglish ? 'Failed to perform bulk action' : 'Échec de l\'action en masse'
              );
            } finally {
              setBulkActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#00A86B';
      case 'pending': return '#FF9500';
      case 'draft': return COLORS.textLight;
      case 'sold': return COLORS.primary;
      case 'rented': return '#5856D6';
      case 'inactive': return COLORS.error;
      default: return COLORS.textLight;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; fr: string }> = {
      active: { en: 'Active', fr: 'Actif' },
      pending: { en: 'Pending', fr: 'En attente' },
      draft: { en: 'Draft', fr: 'Brouillon' },
      sold: { en: 'Sold', fr: 'Vendu' },
      rented: { en: 'Rented', fr: 'Loué' },
      inactive: { en: 'Inactive', fr: 'Inactif' },
    };
    return labels[status]?.[isEnglish ? 'en' : 'fr'] || status;
  };

  const renderProperty = ({ item }: { item: any }) => (
    <View style={styles.propertyCard}>
      <Image 
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }} 
        style={styles.propertyImage}
      />
      <View style={styles.propertyInfo}>
        <View style={styles.propertyHeader}>
          <Text style={styles.propertyTitle} numberOfLines={1}>
            {isEnglish ? (item.title_en || item.titleEn || item.title) : item.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.propertyPrice}>
          ${item.price?.toLocaleString()}
          {item.priceType === 'rent' || item.price_type === 'rent' ? '/mo' : ''}
        </Text>
        
        <Text style={styles.propertyAddress} numberOfLines={1}>
          {item.address}, {item.city}
        </Text>

        {/* Owner Info with Reference Number (NF) */}
        <View style={styles.ownerInfo}>
          <Ionicons name="person-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.ownerText}>
            {item.owner?.full_name || 'Unknown Owner'}
          </Text>
          <TouchableOpacity
            style={styles.referenceBadge}
            onPress={() => {
              // Copy reference number to clipboard or highlight
              setSearchQuery(item.referenceNumber);
            }}
          >
            <Ionicons name="document-text-outline" size={12} color={COLORS.primary} />
            <Text style={styles.referenceText}>
              {isEnglish ? 'NF:' : 'NF:'} {item.referenceNumber}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selection Checkbox */}
        <TouchableOpacity
          style={styles.selectionButton}
          onPress={() => {
            const newSelected = new Set(selectedProperties);
            if (newSelected.has(item.id)) {
              newSelected.delete(item.id);
            } else {
              newSelected.add(item.id);
            }
            setSelectedProperties(newSelected);
          }}
        >
          <Ionicons
            name={selectedProperties.has(item.id) ? 'checkbox' : 'checkbox-outline'}
            size={20}
            color={selectedProperties.has(item.id) ? COLORS.primary : COLORS.textLight}
          />
          <Text style={styles.selectionText}>
            {isEnglish ? 'Select' : 'Sélectionner'}
          </Text>
        </TouchableOpacity>

        {/* Actions */}
        <View style={styles.actions}>
          {item.status === 'pending' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleStatusChange(item.id, 'active')}
            >
              <Ionicons name="checkmark" size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>
                {isEnglish ? 'Approve' : 'Approuver'}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('AdminEditProperty', { propertyId: item.id })}
          >
            <Ionicons name="pencil" size={16} color={COLORS.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash" size={16} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const filters: { key: PropertyStatus | 'all'; label: string }[] = [
    { key: 'all', label: isEnglish ? 'All' : 'Tous' },
    { key: 'pending', label: isEnglish ? 'Pending' : 'En attente' },
    { key: 'active', label: isEnglish ? 'Active' : 'Actifs' },
    { key: 'inactive', label: isEnglish ? 'Inactive' : 'Inactifs' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEnglish ? 'Manage Properties' : 'Gérer les propriétés'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('AdminAddProperty')}>
          <Ionicons name="add" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder={isEnglish ? 'Search by NF, title, owner, address...' : 'Rechercher par NF, titre, propriétaire, adresse...'}
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Selected Properties Actions */}
      {selectedProperties.size > 0 && (
        <View style={styles.selectedActionsContainer}>
          <View style={styles.selectedActions}>
            <Text style={styles.selectedCount}>
              {selectedProperties.size} {isEnglish ? 'selected' : 'sélectionnées'}
            </Text>
            <TouchableOpacity
              style={styles.clearSelectionButton}
              onPress={() => {
                setSelectedProperties(new Set());
                setShowBulkActions(false);
              }}
            >
              <Ionicons name="close-circle" size={18} color={COLORS.error} />
              <Text style={styles.clearSelectionText}>
                {isEnglish ? 'Clear' : 'Effacer'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bulkActionsToggle}
              onPress={() => setShowBulkActions(!showBulkActions)}
            >
              <Ionicons 
                name={showBulkActions ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={COLORS.primary} 
              />
            </TouchableOpacity>
          </View>

          {/* Bulk Actions Menu */}
          {showBulkActions && (
            <View style={styles.bulkActionsMenu}>
              <TouchableOpacity
                style={[styles.bulkActionButton, styles.bulkActionPublish]}
                onPress={async () => {
                  await handleBulkAction('publish');
                }}
                disabled={bulkActionLoading}
              >
                <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                <Text style={styles.bulkActionText}>
                  {isEnglish ? 'Publish' : 'Publier'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.bulkActionButton, styles.bulkActionUnpublish]}
                onPress={async () => {
                  await handleBulkAction('unpublish');
                }}
                disabled={bulkActionLoading}
              >
                <Ionicons name="close-circle" size={20} color={COLORS.white} />
                <Text style={styles.bulkActionText}>
                  {isEnglish ? 'Unpublish' : 'Dépublier'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.bulkActionButton, styles.bulkActionDelete]}
                onPress={async () => {
                  await handleBulkAction('delete');
                }}
                disabled={bulkActionLoading}
              >
                <Ionicons name="trash" size={20} color={COLORS.white} />
                <Text style={styles.bulkActionText}>
                  {isEnglish ? 'Delete' : 'Supprimer'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.bulkActionButton, styles.bulkActionSelectAll]}
                onPress={() => {
                  const allIds = new Set(filteredProperties.map((p: any) => p.id));
                  setSelectedProperties(allIds);
                }}
              >
                <Ionicons name="checkbox" size={20} color={COLORS.white} />
                <Text style={styles.bulkActionText}>
                  {isEnglish ? 'Select All' : 'Tout sélectionner'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Filters */}
      <View style={styles.filterContainer}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterButton, filter === f.key && styles.filterButtonActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Properties List */}
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={renderProperty}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="home-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>
              {isEnglish ? 'No properties found' : 'Aucune propriété trouvée'}
            </Text>
          </View>
        }
      />
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
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.screenPadding,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  selectedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryLight,
    marginHorizontal: SIZES.screenPadding,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
  },
  selectedCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  clearSelectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clearSelectionText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '600',
  },
  selectedActionsContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight || '#E5E5E5',
  },
  bulkActionsToggle: {
    padding: 8,
  },
  bulkActionsMenu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.screenPadding,
    paddingBottom: 12,
    gap: 8,
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: SIZES.radius,
    gap: 8,
    minWidth: 120,
  },
  bulkActionPublish: {
    backgroundColor: COLORS.success || '#00A86B',
  },
  bulkActionUnpublish: {
    backgroundColor: '#FF9500',
  },
  bulkActionDelete: {
    backgroundColor: COLORS.error,
  },
  bulkActionSelectAll: {
    backgroundColor: COLORS.primary,
  },
  bulkActionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: COLORS.background,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  list: {
    padding: SIZES.screenPadding,
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    marginBottom: 12,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  propertyImage: {
    width: 120,
    height: 140,
  },
  propertyInfo: {
    flex: 1,
    padding: 12,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  propertyTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  propertyPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  propertyAddress: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
    flexWrap: 'wrap',
  },
  ownerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  referenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  referenceText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  selectionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  approveButton: {
    backgroundColor: '#00A86B',
  },
  editButton: {
    backgroundColor: COLORS.primaryLight,
  },
  deleteButton: {
    backgroundColor: '#FFE8EC',
  },
  actionButtonText: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
});

export default AdminPropertiesScreen;

