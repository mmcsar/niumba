// Niumba - Admin Inquiries Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useOwnerInquiries } from '../../hooks/useInquiries';
import { useAuth } from '../../context/AuthContext';
import type { Inquiry } from '../../services/inquiryService';

const AdminInquiriesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const isEnglish = i18n.language === 'en';
  
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Use hook for inquiries
  const { inquiries, loading, error, loadInquiries, refresh, updateStatus } = useOwnerInquiries();

  useEffect(() => {
    if (user && loadInquiries) {
      loadInquiries(filterStatus);
    }
  }, [user, filterStatus, loadInquiries]);

  const onRefresh = () => {
    refresh();
  };

  // Transform inquiries to match UI format
  const transformedInquiries = (inquiries || []).map(inquiry => ({
    id: inquiry.id,
    property_title: (inquiry.property as any)?.title || 'Unknown Property',
    user_name: (inquiry.inquirer as any)?.full_name || inquiry.sender_name || 'Unknown',
    user_email: (inquiry.inquirer as any)?.email || inquiry.sender_email || '',
    message: inquiry.message || '',
    status: inquiry.status === 'new' ? 'new' : inquiry.status === 'responded' ? 'replied' : 'read',
    created_at: inquiry.created_at || new Date().toISOString(),
    inquiry: inquiry, // Keep original for actions
  }));

  // Filter by search query
  const filteredInquiries = searchQuery
    ? transformedInquiries.filter(inq =>
        inq.property_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inq.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inq.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inq.message.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transformedInquiries;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return COLORS.error;
      case 'read': return '#FF9500';
      case 'replied': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    if (isEnglish) {
      switch (status) {
        case 'new': return 'NEW';
        case 'read': return 'READ';
        case 'replied': return 'REPLIED';
        default: return status.toUpperCase();
      }
    }
    switch (status) {
      case 'new': return 'NOUVEAU';
      case 'read': return 'LU';
      case 'replied': return 'RÉPONDU';
      default: return status.toUpperCase();
    }
  };

  const handleStatusChange = async (inquiryId: string, newStatus: 'new' | 'read' | 'responded' | 'closed') => {
    const result = await updateStatus(inquiryId, newStatus);
    if (result) {
      refresh();
    }
  };

  const renderInquiry = ({ item }: { item: typeof transformedInquiries[0] }) => {
    if (!item || !item.id) return null;
    
    return (
      <TouchableOpacity 
        style={styles.inquiryCard}
        onPress={() => {
          const newStatus = item.status === 'new' ? 'read' : item.status === 'read' ? 'read' : 'read';
          handleStatusChange(item.id, newStatus as 'new' | 'read' | 'responded' | 'closed');
        }}
      >
      <View style={styles.cardHeader}>
        <Text style={styles.propertyTitle} numberOfLines={1}>{item.property_title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.userRow}>
        <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
        <Text style={styles.userName}>{item.user_name}</Text>
        <Text style={styles.userEmail}>• {item.user_email}</Text>
      </View>
      
      <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
      
      <Text style={styles.date}>
        {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
      </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEnglish ? 'Inquiries' : 'Demandes'}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder={isEnglish ? 'Search inquiries...' : 'Rechercher des demandes...'}
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

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, !filterStatus && styles.filterChipActive]}
          onPress={() => setFilterStatus(undefined)}
        >
          <Text style={[styles.filterChipText, !filterStatus && styles.filterChipTextActive]}>
            {isEnglish ? 'All' : 'Tous'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterStatus === 'new' && styles.filterChipActive]}
          onPress={() => setFilterStatus('new')}
        >
          <Text style={[styles.filterChipText, filterStatus === 'new' && styles.filterChipTextActive]}>
            {isEnglish ? 'New' : 'Nouveau'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterStatus === 'read' && styles.filterChipActive]}
          onPress={() => setFilterStatus('read')}
        >
          <Text style={[styles.filterChipText, filterStatus === 'read' && styles.filterChipTextActive]}>
            {isEnglish ? 'Read' : 'Lu'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterStatus === 'responded' && styles.filterChipActive]}
          onPress={() => setFilterStatus('responded')}
        >
          <Text style={[styles.filterChipText, filterStatus === 'responded' && styles.filterChipTextActive]}>
            {isEnglish ? 'Replied' : 'Répondu'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredInquiries}
        renderItem={renderInquiry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.empty}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : error ? (
            <View style={styles.empty}>
              <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
              <Text style={styles.emptyText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                <Text style={styles.retryButtonText}>
                  {isEnglish ? 'Retry' : 'Réessayer'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>
                {isEnglish ? 'No inquiries yet' : 'Aucune demande'}
              </Text>
            </View>
          )
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
  list: {
    padding: SIZES.screenPadding,
  },
  inquiryCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 12,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textLight,
    marginLeft: 6,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 8,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.screenPadding,
    marginBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default AdminInquiriesScreen;

