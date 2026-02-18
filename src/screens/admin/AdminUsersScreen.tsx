// Niumba - Admin Users Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  StatusBar,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useUsers, useUser } from '../../hooks/useUsers';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../services/userService';

const AdminUsersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const { user: currentUser } = useAuth();
  const isEnglish = i18n.language === 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'user' | 'agent' | 'admin' | undefined>(undefined);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Use hook for users
  const { users, loading, error, refresh, hasMore, loadMore } = useUsers({
    role: filterRole,
    search: searchQuery || undefined,
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return COLORS.error;
      case 'agent': return COLORS.primary;
      default: return COLORS.textSecondary;
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => setSelectedUser(item)}
    >
      <View style={styles.avatar}>
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.full_name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.full_name || 'No name'}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
        <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
          {item.role?.toUpperCase() || 'USER'}
        </Text>
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
        <Text style={styles.title}>{isEnglish ? 'Users' : 'Utilisateurs'}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder={isEnglish ? 'Search users...' : 'Rechercher des utilisateurs...'}
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
          style={[styles.filterChip, !filterRole && styles.filterChipActive]}
          onPress={() => setFilterRole(undefined)}
        >
          <Text style={[styles.filterChipText, !filterRole && styles.filterChipTextActive]}>
            {isEnglish ? 'All' : 'Tous'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterRole === 'user' && styles.filterChipActive]}
          onPress={() => setFilterRole('user')}
        >
          <Text style={[styles.filterChipText, filterRole === 'user' && styles.filterChipTextActive]}>
            {isEnglish ? 'Users' : 'Utilisateurs'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterRole === 'agent' && styles.filterChipActive]}
          onPress={() => setFilterRole('agent')}
        >
          <Text style={[styles.filterChipText, filterRole === 'agent' && styles.filterChipTextActive]}>
            {isEnglish ? 'Agents' : 'Agents'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterRole === 'admin' && styles.filterChipActive]}
          onPress={() => setFilterRole('admin')}
        >
          <Text style={[styles.filterChipText, filterRole === 'admin' && styles.filterChipTextActive]}>
            {isEnglish ? 'Admins' : 'Admins'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        onEndReached={() => {
          if (hasMore && !loading) {
            loadMore();
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          loading ? (
            <View style={styles.empty}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : error ? (
            <View style={styles.empty}>
              <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
              <Text style={styles.emptyText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={refresh}>
                <Text style={styles.retryButtonText}>
                  {isEnglish ? 'Retry' : 'Réessayer'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>
                {isEnglish ? 'No users found' : 'Aucun utilisateur trouvé'}
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 12,
    ...SHADOWS.card,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
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
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
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

export default AdminUsersScreen;

