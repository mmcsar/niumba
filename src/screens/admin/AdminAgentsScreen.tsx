// Niumba - Admin Agents Management Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  FlatList,
  StatusBar,
  Switch,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useAgents, useAgent, useCreateAgent } from '../../hooks/useAgents';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Agent } from '../../services/agentService';
import { suspendAgent, unsuspendAgent } from '../../services/agentService';
import { errorLog } from '../../utils/logHelper';
import { pickImage, takePhoto, uploadImage } from '../../services/imageService';

interface AdminAgentsScreenProps {
  navigation: any;
  route?: {
    params?: {
      showAddModal?: boolean;
    };
  };
}

const AdminAgentsScreen: React.FC<AdminAgentsScreenProps> = ({ navigation, route }) => {
  const { i18n } = useTranslation();
  const { user, profile, isAdmin } = useAuth();
  const isEnglish = i18n.language === 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(route?.params?.showAddModal || false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  // Open modal if route param is set
  useEffect(() => {
    if (route?.params?.showAddModal) {
      setShowAddModal(true);
    }
  }, [route?.params?.showAddModal]);

  // Use hooks for agents
  const { agents, loading, error, refresh, hasMore, loadMore } = useAgents({
    isActive: filterStatus === 'active' ? true : filterStatus === 'inactive' ? false : undefined,
    isVerified: filterStatus === 'pending' ? false : undefined,
    search: searchQuery || undefined,
  });
  
  // Use hook only when an agent is selected
  const { updateStatus: updateAgentStatus, refresh: refreshAgent } = useAgent(selectedAgent?.id || '');
  const { create: createAgent, loading: creatingAgent } = useCreateAgent();
  const { create: updateAgent, loading: updatingAgent } = useCreateAgent();

  // Filter agents locally for additional filtering (if needed)
  const filteredAgents = agents;

  // Get status counts
  const statusCounts = {
    all: agents.length,
    active: agents.filter(a => a.is_active && a.is_verified).length,
    inactive: agents.filter(a => !a.is_active).length,
    pending: agents.filter(a => a.is_active && !a.is_verified).length,
  };

  // New agent form
  const [newAgent, setNewAgent] = useState({
    full_name: '',
    email: '',
    phone: '',
    agency_name: '',
    license_number: '',
    bio: '',
    specializations: [] as string[],
    regions: [] as string[],
    avatarUri: null as string | null,
  });

  // Edit agent form
  const [editAgent, setEditAgent] = useState({
    full_name: '',
    email: '',
    phone: '',
    agency_name: '',
    license_number: '',
    bio: '',
    specializations: [] as string[],
    regions: [] as string[],
    avatarUri: null as string | null,
  });

  const onRefresh = () => {
    refresh();
  };

  const toggleAgentStatus = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    try {
      // Use agentService directly for updates
      const { updateAgentStatus } = await import('../../services/agentService');
      const success = await updateAgentStatus(agentId, { is_active: !agent.is_active });
      if (success) {
        refresh();
      } else {
        Alert.alert(
          isEnglish ? 'Error' : 'Erreur',
          isEnglish ? 'Failed to update agent status' : 'Échec de la mise à jour du statut'
        );
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      errorLog('Error updating agent status in AdminAgentsScreen', errorObj, { agentId });
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Failed to update agent status' : 'Échec de la mise à jour du statut'
      );
    }
  };

  const verifyAgent = (agentId: string) => {
    Alert.alert(
      isEnglish ? 'Verify Agent' : 'Vérifier l\'agent',
      isEnglish 
        ? 'Are you sure you want to verify this agent?' 
        : 'Êtes-vous sûr de vouloir vérifier cet agent ?',
      [
        { text: isEnglish ? 'Cancel' : 'Annuler', style: 'cancel' },
        {
          text: isEnglish ? 'Verify' : 'Vérifier',
          onPress: async () => {
            if (!selectedAgent) return;
            
            try {
              // Use agentService directly for updates
              const { updateAgentStatus } = await import('../../services/agentService');
              const success = await updateAgentStatus(selectedAgent.id, { is_verified: true });
              if (success) {
                refresh();
              } else {
                Alert.alert(
                  isEnglish ? 'Error' : 'Erreur',
                  isEnglish ? 'Failed to verify agent' : 'Échec de la vérification'
                );
              }
            } catch (err) {
              const errorObj = err instanceof Error ? err : new Error(String(err));
              errorLog('Error verifying agent in AdminAgentsScreen', errorObj, { agentId: selectedAgent.id });
              Alert.alert(
                isEnglish ? 'Error' : 'Erreur',
                isEnglish ? 'Failed to verify agent' : 'Échec de la vérification'
              );
            }
            setShowDetailModal(false);
          },
        },
      ]
    );
  };

  const handlePickAvatar = async (isEdit: boolean = false) => {
    Alert.alert(
      isEnglish ? 'Select Photo' : 'Sélectionner une photo',
      '',
      [
        {
          text: isEnglish ? 'Gallery' : 'Galerie',
          onPress: async () => {
            const uri = await pickImage();
            if (uri) {
              if (isEdit) {
                setEditAgent({ ...editAgent, avatarUri: uri });
              } else {
                setNewAgent({ ...newAgent, avatarUri: uri });
              }
            }
          },
        },
        {
          text: isEnglish ? 'Camera' : 'Caméra',
          onPress: async () => {
            const uri = await takePhoto();
            if (uri) {
              if (isEdit) {
                setEditAgent({ ...editAgent, avatarUri: uri });
              } else {
                setNewAgent({ ...newAgent, avatarUri: uri });
              }
            }
          },
        },
        { text: isEnglish ? 'Cancel' : 'Annuler', style: 'cancel' },
      ]
    );
  };

  const updateAgentProfile = async () => {
    if (!editingAgent) return;

    if (!editAgent.full_name || !editAgent.email || !editAgent.phone) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Please fill in all required fields' : 'Veuillez remplir tous les champs requis'
      );
      return;
    }

    try {
      let avatarUrl = editingAgent.avatar_url;

      // Upload avatar if a new one was selected
      // Format: {userId}/{filename} for security
      if (editAgent.avatarUri) {
        const uploadResult = await uploadImage(editAgent.avatarUri, user?.id || '', 'avatars', 'avatars');
        if (uploadResult.success && uploadResult.url) {
          avatarUrl = uploadResult.url;
        }
      }

      // Update profile (full_name, email, phone, avatar_url)
      const { error: profileError } = await (supabase
        .from('profiles') as any)
        .update({
          full_name: editAgent.full_name,
          email: editAgent.email,
          phone: editAgent.phone,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', editingAgent.user_id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      // Update agent profile
      const { upsertAgent } = await import('../../services/agentService');
      const updatedAgent = await upsertAgent({
        user_id: editingAgent.user_id,
        agency_name: editAgent.agency_name || undefined,
        license_number: editAgent.license_number || undefined,
        bio: editAgent.bio || undefined,
        specializations: editAgent.specializations.length > 0 ? editAgent.specializations : undefined,
        regions: editAgent.regions.length > 0 ? editAgent.regions : undefined,
        is_active: editingAgent.is_active,
        is_verified: editingAgent.is_verified,
      });

      if (updatedAgent) {
        Alert.alert(
          isEnglish ? 'Success' : 'Succès',
          isEnglish ? 'Agent updated successfully' : 'Agent mis à jour avec succès'
        );
        setShowEditModal(false);
        setEditingAgent(null);
        refresh();
      } else {
        throw new Error('Failed to update agent');
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      errorLog('Error updating agent profile in AdminAgentsScreen', errorObj, { agentId: editingAgent.id });
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Failed to update agent' : 'Échec de la mise à jour de l\'agent'
      );
    }
  };

  const deleteAgent = async (agentId: string) => {
    Alert.alert(
      isEnglish ? 'Delete Agent' : 'Supprimer l\'agent',
      isEnglish
        ? 'This action cannot be undone. All agent data will be permanently deleted.'
        : 'Cette action est irréversible. Toutes les données de l\'agent seront supprimées.',
      [
        { text: isEnglish ? 'Cancel' : 'Annuler', style: 'cancel' },
        {
          text: isEnglish ? 'Delete' : 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { deleteAgent: deleteAgentService } = await import('../../services/agentService');
              const success = await deleteAgentService(agentId);
              if (success) {
                refresh();
                setShowDetailModal(false);
                setSelectedAgent(null);
                Alert.alert(
                  isEnglish ? 'Success' : 'Succès',
                  isEnglish ? 'Agent deleted successfully' : 'Agent supprimé avec succès'
                );
              } else {
                Alert.alert(
                  isEnglish ? 'Error' : 'Erreur',
                  isEnglish ? 'Failed to delete agent' : 'Échec de la suppression'
                );
              }
            } catch (error) {
              const errorObj = error instanceof Error ? error : new Error(String(error));
              errorLog('Error deleting agent in AdminAgentsScreen', errorObj, { agentId });
              Alert.alert(
                isEnglish ? 'Error' : 'Erreur',
                isEnglish ? 'Failed to delete agent' : 'Échec de la suppression'
              );
            }
          },
        },
      ]
    );
  };

  const addNewAgent = async () => {
    if (!newAgent.full_name || !newAgent.email || !newAgent.phone) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Please fill in all required fields' : 'Veuillez remplir tous les champs requis'
      );
      return;
    }

    if (!user) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'You must be logged in to create an agent' : 'Vous devez être connecté pour créer un agent'
      );
      return;
    }

    try {
      // Upload avatar if one was selected
      // Format: {userId}/{filename} for security
      let avatarUrl: string | null = null;
      if (newAgent.avatarUri) {
        const uploadResult = await uploadImage(newAgent.avatarUri, user?.id || '', 'avatars', 'avatars');
        if (uploadResult.success && uploadResult.url) {
          avatarUrl = uploadResult.url;
        }
      }

      // Generate a temporary password (user will need to reset it)
      const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`;
      
      // Create user in Supabase Auth (requires admin privileges)
      // Note: This requires service role key, not anon key
      // For now, we'll create the profile directly and let the agent complete registration
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newAgent.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: newAgent.full_name,
          phone: newAgent.phone,
        },
      });

      if (authError || !authData?.user) {
        // If admin API not available, create profile directly (user will register later)
        // Error logged by agentService if needed
        
        // Generate a temporary UUID for the profile
        const tempUserId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        
        // Create profile with role 'agent'
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: tempUserId,
            email: newAgent.email,
            full_name: newAgent.full_name,
            phone: newAgent.phone,
            avatar_url: avatarUrl,
            role: 'agent',
          } as any)
          .select()
          .single();

        if (profileError) {
          throw new Error(profileError.message);
        }

        if (!profileData) {
          throw new Error('Failed to create profile');
        }

        // Create agent profile
        const result = await createAgent({
          user_id: (profileData as any)?.id || tempUserId,
          agency_name: newAgent.agency_name || undefined,
          license_number: newAgent.license_number || undefined,
          bio: newAgent.bio || undefined,
          specializations: newAgent.specializations.length > 0 ? newAgent.specializations : undefined,
          regions: newAgent.regions.length > 0 ? newAgent.regions : undefined,
          is_active: true,
          is_verified: false,
        });

        if (result) {
          setShowAddModal(false);
          setNewAgent({
            full_name: '',
            email: '',
            phone: '',
            agency_name: '',
            license_number: '',
            bio: '',
            specializations: [],
            regions: [],
            avatarUri: null,
          });
          refresh();
          
          Alert.alert(
            isEnglish ? 'Success' : 'Succès',
            isEnglish 
              ? 'Agent profile created! The agent will need to complete registration by signing up with this email.'
              : 'Profil agent créé ! L\'agent devra compléter l\'inscription en s\'inscrivant avec cet email.'
          );
        } else {
          throw new Error('Failed to create agent profile');
        }
        return;
      }

      // If auth user was created successfully, create profile and agent
      const userId = authData.user.id;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: newAgent.email,
          full_name: newAgent.full_name,
          phone: newAgent.phone,
          avatar_url: avatarUrl,
          role: 'agent',
        } as any);

      if (profileError) {
        throw new Error(profileError.message);
      }

      // Then create agent profile
      const result = await createAgent({
        user_id: userId,
        agency_name: newAgent.agency_name || undefined,
        license_number: newAgent.license_number || undefined,
        bio: newAgent.bio || undefined,
        specializations: newAgent.specializations.length > 0 ? newAgent.specializations : undefined,
        regions: newAgent.regions.length > 0 ? newAgent.regions : undefined,
        is_active: true,
        is_verified: false,
      });

      if (result) {
        setShowAddModal(false);
        setNewAgent({
          full_name: '',
          email: '',
          phone: '',
          agency_name: '',
          license_number: '',
          bio: '',
          specializations: [],
          regions: [],
          avatarUri: null,
        });
        refresh(); // Refresh agents list
        
        Alert.alert(
          isEnglish ? 'Success' : 'Succès',
          isEnglish 
            ? 'Agent created successfully! A temporary password has been sent to their email.'
            : 'Agent créé avec succès ! Un mot de passe temporaire a été envoyé à leur email.'
        );
      } else {
        Alert.alert(
          isEnglish ? 'Error' : 'Erreur',
          isEnglish ? 'Failed to create agent profile. User was created but agent profile failed.' : 'Échec de la création du profil agent. L\'utilisateur a été créé mais le profil agent a échoué.'
        );
      }
    } catch (error: any) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      errorLog('Error creating agent in AdminAgentsScreen', errorObj, { newAgent });
      const errorMessage = error?.message || (isEnglish ? 'An error occurred' : 'Une erreur s\'est produite');
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        errorMessage
      );
    }
  };

  const FilterChip: React.FC<{
    label: string;
    count: number;
    active: boolean;
    onPress: () => void;
  }> = ({ label, count, active, onPress }) => (
    <TouchableOpacity
      style={[styles.filterChip, active && styles.filterChipActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
        {label}
      </Text>
      <View style={[styles.filterChipBadge, active && styles.filterChipBadgeActive]}>
        <Text style={[styles.filterChipBadgeText, active && styles.filterChipBadgeTextActive]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => (
    <TouchableOpacity
      style={styles.agentCard}
      onPress={() => {
        setSelectedAgent(agent);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.agentHeader}>
        {agent.avatar_url ? (
          <Image source={{ uri: agent.avatar_url }} style={styles.agentAvatar} />
        ) : (
          <View style={[styles.agentAvatar, styles.agentAvatarPlaceholder]}>
            <Text style={styles.agentAvatarText}>
              {agent.full_name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.agentInfo}>
          <View style={styles.agentNameRow}>
            <Text style={styles.agentName}>{agent.full_name}</Text>
            {agent.is_verified && (
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
            )}
          </View>
          <Text style={styles.agentAgency}>{agent.agency_name}</Text>
          <Text style={styles.agentLicense}>{agent.license_number}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          agent.is_suspended && styles.statusBadgeSuspended,
          !agent.is_active && !agent.is_suspended && styles.statusBadgeInactive,
          agent.is_active && !agent.is_verified && !agent.is_suspended && styles.statusBadgePending,
        ]}>
          <Text style={[
            styles.statusBadgeText,
            agent.is_suspended && styles.statusBadgeTextSuspended,
            !agent.is_active && !agent.is_suspended && styles.statusBadgeTextInactive,
            agent.is_active && !agent.is_verified && !agent.is_suspended && styles.statusBadgeTextPending,
          ]}>
            {agent.is_suspended
              ? (isEnglish ? 'Suspended' : 'Suspendu')
              : !agent.is_active 
                ? (isEnglish ? 'Inactive' : 'Inactif')
                : !agent.is_verified 
                  ? (isEnglish ? 'Pending' : 'En attente')
                  : (isEnglish ? 'Active' : 'Actif')}
          </Text>
        </View>
      </View>

      {/* Stats */}
      {agent.stats && (
        <View style={styles.agentStats}>
          <View style={styles.agentStat}>
            <Text style={styles.agentStatValue}>{agent.stats.active_listings || 0}</Text>
            <Text style={styles.agentStatLabel}>{isEnglish ? 'Listings' : 'Annonces'}</Text>
          </View>
          <View style={styles.agentStatDivider} />
          <View style={styles.agentStat}>
            <Text style={styles.agentStatValue}>{agent.stats.total_sales || 0}</Text>
            <Text style={styles.agentStatLabel}>{isEnglish ? 'Sales' : 'Ventes'}</Text>
          </View>
          <View style={styles.agentStatDivider} />
          <View style={styles.agentStat}>
            <Text style={styles.agentStatValue}>{agent.stats.total_inquiries || 0}</Text>
            <Text style={styles.agentStatLabel}>{isEnglish ? 'Inquiries' : 'Demandes'}</Text>
          </View>
          <View style={styles.agentStatDivider} />
          <View style={styles.agentStat}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={styles.agentStatValue}>{agent.stats.average_rating?.toFixed(1) || '-'}</Text>
            </View>
            <Text style={styles.agentStatLabel}>
              ({agent.stats.total_reviews || 0})
            </Text>
          </View>
        </View>
      )}

      {/* Regions */}
      {agent.regions && agent.regions.length > 0 && (
        <View style={styles.regionTags}>
          {agent.regions.map((region, index) => (
            <View key={index} style={styles.regionTag}>
              <Ionicons name="location" size={12} color={COLORS.primary} />
              <Text style={styles.regionTagText}>{region}</Text>
            </View>
          ))}
        </View>
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
          {isEnglish ? 'Agents Management' : 'Gestion des Agents'}
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder={isEnglish ? 'Search agents...' : 'Rechercher des agents...'}
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
      </View>

      {/* Filter Chips */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        <FilterChip
          label={isEnglish ? 'All' : 'Tous'}
          count={statusCounts.all}
          active={filterStatus === 'all'}
          onPress={() => setFilterStatus('all')}
        />
        <FilterChip
          label={isEnglish ? 'Active' : 'Actifs'}
          count={statusCounts.active}
          active={filterStatus === 'active'}
          onPress={() => setFilterStatus('active')}
        />
        <FilterChip
          label={isEnglish ? 'Pending' : 'En attente'}
          count={statusCounts.pending}
          active={filterStatus === 'pending'}
          onPress={() => setFilterStatus('pending')}
        />
        <FilterChip
          label={isEnglish ? 'Inactive' : 'Inactifs'}
          count={statusCounts.inactive}
          active={filterStatus === 'inactive'}
          onPress={() => setFilterStatus('inactive')}
        />
      </ScrollView>

      {/* Agents List */}
      <FlatList
        data={filteredAgents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AgentCard agent={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
        onEndReached={() => {
          if (hasMore && !loading) {
            loadMore();
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : error ? (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
              <Text style={styles.emptyStateText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={refresh}>
                <Text style={styles.retryButtonText}>
                  {isEnglish ? 'Retry' : 'Réessayer'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyStateText}>
                {isEnglish ? 'No agents found' : 'Aucun agent trouvé'}
              </Text>
            </View>
          )
        }
      />

      {/* Agent Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        {selectedAgent && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {isEnglish ? 'Agent Details' : 'Détails de l\'agent'}
                  </Text>
                  <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                    <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>

                {/* Agent Profile */}
                <View style={styles.modalProfile}>
                  {selectedAgent.avatar_url ? (
                    <Image source={{ uri: selectedAgent.avatar_url }} style={styles.modalAvatar} />
                  ) : (
                    <View style={[styles.modalAvatar, styles.agentAvatarPlaceholder]}>
                      <Text style={styles.agentAvatarText}>
                        {selectedAgent.full_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.modalName}>{selectedAgent.full_name}</Text>
                  <Text style={styles.modalAgency}>{selectedAgent.agency_name}</Text>
                  <View style={styles.modalBadges}>
                    {selectedAgent.is_verified && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                        <Text style={styles.verifiedBadgeText}>
                          {isEnglish ? 'Verified' : 'Vérifié'}
                        </Text>
                      </View>
                    )}
                    <View style={[
                      styles.modalStatusBadge,
                      selectedAgent.is_suspended && styles.modalStatusBadgeSuspended,
                      !selectedAgent.is_active && !selectedAgent.is_suspended && styles.modalStatusBadgeInactive,
                    ]}>
                      <Text style={[
                        styles.modalStatusText,
                        selectedAgent.is_suspended && styles.modalStatusTextInactive,
                        !selectedAgent.is_active && !selectedAgent.is_suspended && styles.modalStatusTextInactive,
                      ]}>
                        {selectedAgent.is_suspended
                          ? (isEnglish ? 'Suspended' : 'Suspendu')
                          : selectedAgent.is_active 
                            ? (isEnglish ? 'Active' : 'Actif')
                            : (isEnglish ? 'Inactive' : 'Inactif')}
                      </Text>
                    </View>
                    {selectedAgent.is_suspended && selectedAgent.suspended_reason && (
                      <View style={styles.suspendedWarning}>
                        <Ionicons name="warning" size={16} color={COLORS.error} />
                        <Text style={styles.suspendedReason}>
                          {selectedAgent.suspended_reason}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Contact Info */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>
                    {isEnglish ? 'Contact Information' : 'Coordonnées'}
                  </Text>
                  <View style={styles.contactItem}>
                    <Ionicons name="mail" size={20} color={COLORS.primary} />
                    <Text style={styles.contactText}>{selectedAgent.email}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Ionicons name="call" size={20} color={COLORS.primary} />
                    <Text style={styles.contactText}>{selectedAgent.phone}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Ionicons name="card" size={20} color={COLORS.primary} />
                    <Text style={styles.contactText}>{selectedAgent.license_number}</Text>
                  </View>
                </View>

                {/* Stats */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>
                    {isEnglish ? 'Performance' : 'Performance'}
                  </Text>
                  <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                      <Text style={styles.statBoxValue}>{selectedAgent.stats?.total_properties || 0}</Text>
                      <Text style={styles.statBoxLabel}>{isEnglish ? 'Total Properties' : 'Total propriétés'}</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statBoxValue}>{selectedAgent.stats?.active_listings || 0}</Text>
                      <Text style={styles.statBoxLabel}>{isEnglish ? 'Active Listings' : 'Annonces actives'}</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statBoxValue}>{selectedAgent.stats?.total_sales || 0}</Text>
                      <Text style={styles.statBoxLabel}>{isEnglish ? 'Total Sales' : 'Total ventes'}</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statBoxValue}>{selectedAgent.stats?.total_inquiries || 0}</Text>
                      <Text style={styles.statBoxLabel}>{isEnglish ? 'Inquiries' : 'Demandes'}</Text>
                    </View>
                  </View>
                </View>

                {/* Specializations */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>
                    {isEnglish ? 'Specializations' : 'Spécialisations'}
                  </Text>
                  <View style={styles.tagsContainer}>
                    {(selectedAgent.specializations || []).map((spec, index) => (
                      <View key={index} style={styles.specTag}>
                        <Text style={styles.specTagText}>{spec}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Regions */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>
                    {isEnglish ? 'Coverage Areas' : 'Zones couvertes'}
                  </Text>
                  <View style={styles.tagsContainer}>
                    {(selectedAgent.regions || []).map((region, index) => (
                      <View key={index} style={styles.regionTagLarge}>
                        <Ionicons name="location" size={14} color={COLORS.primary} />
                        <Text style={styles.regionTagLargeText}>{region}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.modalActions}>
                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>
                      {isEnglish ? 'Active Status' : 'Statut actif'}
                    </Text>
                    <Switch
                      value={selectedAgent.is_active}
                      onValueChange={() => {
                        toggleAgentStatus(selectedAgent.id);
                        setSelectedAgent({
                          ...selectedAgent,
                          is_active: !selectedAgent.is_active,
                        });
                      }}
                      trackColor={{ false: COLORS.border, true: COLORS.primary }}
                      thumbColor={COLORS.white}
                    />
                  </View>

                  {!selectedAgent.is_verified && (
                    <TouchableOpacity
                      style={styles.verifyButton}
                      onPress={() => verifyAgent(selectedAgent.id)}
                    >
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                      <Text style={styles.verifyButtonText}>
                        {isEnglish ? 'Verify Agent' : 'Vérifier l\'agent'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Suspend/Unsuspend Button (Admin only) */}
                  {isAdmin && (
                    selectedAgent.is_suspended ? (
                      <TouchableOpacity
                        style={styles.unsuspendButton}
                        onPress={async () => {
                          if (!user || !profile) return;
                          Alert.alert(
                            isEnglish ? 'Unsuspend Agent' : 'Réactiver l\'agent',
                            isEnglish 
                              ? 'Are you sure you want to unsuspend this agent?' 
                              : 'Êtes-vous sûr de vouloir réactiver cet agent ?',
                            [
                              { text: isEnglish ? 'Cancel' : 'Annuler', style: 'cancel' },
                              {
                                text: isEnglish ? 'Unsuspend' : 'Réactiver',
                                onPress: async () => {
                                  const success = await unsuspendAgent(
                                    selectedAgent.id,
                                    user.id,
                                    profile.full_name || user.email || 'Admin'
                                  );
                                  if (success) {
                                    refresh();
                                    setShowDetailModal(false);
                                    Alert.alert(
                                      isEnglish ? 'Success' : 'Succès',
                                      isEnglish ? 'Agent unsuspended' : 'Agent réactivé'
                                    );
                                  } else {
                                    Alert.alert(
                                      isEnglish ? 'Error' : 'Erreur',
                                      isEnglish ? 'Failed to unsuspend agent' : 'Échec de la réactivation'
                                    );
                                  }
                                },
                              },
                            ]
                          );
                        }}
                      >
                        <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} />
                        <Text style={styles.unsuspendButtonText}>
                          {isEnglish ? 'Unsuspend Agent' : 'Réactiver l\'agent'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.suspendButton}
                        onPress={() => {
                          // Show reason input dialog
                          Alert.prompt(
                            isEnglish ? 'Suspend Agent' : 'Suspendre l\'agent',
                            isEnglish 
                              ? 'Enter reason for suspension (required for security):' 
                              : 'Entrez la raison de la suspension (requis pour la sécurité) :',
                            [
                              { text: isEnglish ? 'Cancel' : 'Annuler', style: 'cancel' },
                              {
                                text: isEnglish ? 'Suspend' : 'Suspendre',
                                style: 'destructive',
                                onPress: async (reason: string | undefined) => {
                                  if (!reason || !reason.trim()) {
                                    Alert.alert(
                                      isEnglish ? 'Error' : 'Erreur',
                                      isEnglish ? 'Reason is required' : 'La raison est requise'
                                    );
                                    return;
                                  }
                                  if (!user || !profile) return;
                                  
                                  const success = await suspendAgent(
                                    selectedAgent.id,
                                    reason.trim(),
                                    user.id,
                                    profile.full_name || user.email || 'Admin'
                                  );
                                  if (success) {
                                    refresh();
                                    setShowDetailModal(false);
                                    Alert.alert(
                                      isEnglish ? 'Success' : 'Succès',
                                      isEnglish ? 'Agent suspended' : 'Agent suspendu'
                                    );
                                  } else {
                                    Alert.alert(
                                      isEnglish ? 'Error' : 'Erreur',
                                      isEnglish ? 'Failed to suspend agent' : 'Échec de la suspension'
                                    );
                                  }
                                },
                              },
                            ],
                            'plain-text'
                          );
                        }}
                      >
                        <Ionicons name="ban" size={20} color={COLORS.white} />
                        <Text style={styles.suspendButtonText}>
                          {isEnglish ? 'Suspend Agent' : 'Suspendre l\'agent'}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}

                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      setEditingAgent(selectedAgent);
                      setEditAgent({
                        full_name: selectedAgent.full_name,
                        email: selectedAgent.email,
                        phone: selectedAgent.phone || '',
                        agency_name: selectedAgent.agency_name || '',
                        license_number: selectedAgent.license_number || '',
                        bio: selectedAgent.bio || '',
                        specializations: selectedAgent.specializations || [],
                        regions: selectedAgent.regions || [],
                        avatarUri: null, // Will use existing avatar_url from profile
                      });
                      setShowDetailModal(false);
                      setShowEditModal(true);
                    }}
                  >
                    <Ionicons name="pencil" size={20} color={COLORS.white} />
                    <Text style={styles.editButtonText}>
                      {isEnglish ? 'Edit Agent' : 'Modifier l\'agent'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.viewPropertiesButton}
                    onPress={() => {
                      setShowDetailModal(false);
                      navigation.navigate('AdminProperties', { agentId: selectedAgent.id });
                    }}
                  >
                    <Ionicons name="home" size={20} color={COLORS.primary} />
                    <Text style={styles.viewPropertiesText}>
                      {isEnglish ? 'View Properties' : 'Voir les propriétés'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteAgent(selectedAgent.id)}
                  >
                    <Ionicons name="trash" size={20} color={COLORS.error} />
                    <Text style={styles.deleteButtonText}>
                      {isEnglish ? 'Delete Agent' : 'Supprimer l\'agent'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>

      {/* Add Agent Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEnglish ? 'Add New Agent' : 'Ajouter un agent'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {isEnglish ? 'Full Name *' : 'Nom complet *'}
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={isEnglish ? 'Enter full name' : 'Entrez le nom complet'}
                  value={newAgent.full_name}
                  onChangeText={(text) => setNewAgent({ ...newAgent, full_name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {isEnglish ? 'Email *' : 'Email *'}
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={isEnglish ? 'Enter email' : 'Entrez l\'email'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={newAgent.email}
                  onChangeText={(text) => setNewAgent({ ...newAgent, email: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {isEnglish ? 'Phone *' : 'Téléphone *'}
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="+243 99 XXX XXXX"
                  keyboardType="phone-pad"
                  value={newAgent.phone}
                  onChangeText={(text) => setNewAgent({ ...newAgent, phone: text })}
                />
              </View>

              {/* Avatar Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {isEnglish ? 'Profile Photo' : 'Photo de profil'}
                </Text>
                <TouchableOpacity
                  style={styles.avatarSelector}
                  onPress={() => handlePickAvatar(false)}
                >
                  {newAgent.avatarUri ? (
                    <Image source={{ uri: newAgent.avatarUri }} style={styles.avatarPreview} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="camera" size={32} color={COLORS.textLight} />
                      <Text style={styles.avatarPlaceholderText}>
                        {isEnglish ? 'Add Photo' : 'Ajouter une photo'}
                      </Text>
                    </View>
                  )}
                  {newAgent.avatarUri && (
                    <TouchableOpacity
                      style={styles.removeAvatarButton}
                      onPress={() => setNewAgent({ ...newAgent, avatarUri: null })}
                    >
                      <Ionicons name="close-circle" size={24} color={COLORS.error} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {isEnglish ? 'Agency Name' : 'Nom de l\'agence'}
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={isEnglish ? 'Enter agency name' : 'Entrez le nom de l\'agence'}
                  value={newAgent.agency_name}
                  onChangeText={(text) => setNewAgent({ ...newAgent, agency_name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {isEnglish ? 'License Number' : 'Numéro de licence'}
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="AGT-XXXX-XXX"
                  autoCapitalize="characters"
                  value={newAgent.license_number}
                  onChangeText={(text) => setNewAgent({ ...newAgent, license_number: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {isEnglish ? 'Bio' : 'Biographie'}
                </Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder={isEnglish ? 'Enter agent bio' : 'Entrez la biographie de l\'agent'}
                  multiline
                  numberOfLines={4}
                  value={newAgent.bio}
                  onChangeText={(text) => setNewAgent({ ...newAgent, bio: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {isEnglish ? 'Specializations (comma separated)' : 'Spécialisations (séparées par des virgules)'}
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={isEnglish ? 'e.g., Residential, Commercial' : 'ex: Résidentiel, Commercial'}
                  value={newAgent.specializations.join(', ')}
                  onChangeText={(text) => {
                    const specs = text.split(',').map(s => s.trim()).filter(s => s.length > 0);
                    setNewAgent({ ...newAgent, specializations: specs });
                  }}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {isEnglish ? 'Regions (comma separated)' : 'Régions (séparées par des virgules)'}
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={isEnglish ? 'e.g., Kinshasa, Lubumbashi' : 'ex: Kinshasa, Lubumbashi'}
                  value={newAgent.regions.join(', ')}
                  onChangeText={(text) => {
                    const regions = text.split(',').map(r => r.trim()).filter(r => r.length > 0);
                    setNewAgent({ ...newAgent, regions });
                  }}
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, creatingAgent && styles.submitButtonDisabled]} 
                onPress={addNewAgent}
                disabled={creatingAgent}
              >
                {creatingAgent ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isEnglish ? 'Add Agent' : 'Ajouter l\'agent'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Agent Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEnglish ? 'Edit Agent' : 'Modifier l\'agent'}
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {isEnglish ? 'Full Name *' : 'Nom complet *'}
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={isEnglish ? 'Enter full name' : 'Entrez le nom complet'}
                  value={editAgent.full_name}
                  onChangeText={(text) => setEditAgent({ ...editAgent, full_name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {isEnglish ? 'Email *' : 'Email *'}
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={isEnglish ? 'Enter email' : 'Entrez l\'email'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={editAgent.email}
                  onChangeText={(text) => setEditAgent({ ...editAgent, email: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {isEnglish ? 'Phone *' : 'Téléphone *'}
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="+243 99 XXX XXXX"
                  keyboardType="phone-pad"
                  value={editAgent.phone}
                  onChangeText={(text) => setEditAgent({ ...editAgent, phone: text })}
                />
              </View>

              {/* Avatar Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {isEnglish ? 'Profile Photo' : 'Photo de profil'}
                </Text>
                <TouchableOpacity
                  style={styles.avatarSelector}
                  onPress={() => handlePickAvatar(true)}
                >
                  {editAgent.avatarUri ? (
                    <Image source={{ uri: editAgent.avatarUri }} style={styles.avatarPreview} />
                  ) : editingAgent?.avatar_url ? (
                    <Image source={{ uri: editingAgent.avatar_url }} style={styles.avatarPreview} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="camera" size={32} color={COLORS.textLight} />
                      <Text style={styles.avatarPlaceholderText}>
                        {isEnglish ? 'Add Photo' : 'Ajouter une photo'}
                      </Text>
                    </View>
                  )}
                  {(editAgent.avatarUri || editingAgent?.avatar_url) && (
                    <TouchableOpacity
                      style={styles.removeAvatarButton}
                      onPress={() => setEditAgent({ ...editAgent, avatarUri: null })}
                    >
                      <Ionicons name="close-circle" size={24} color={COLORS.error} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {isEnglish ? 'Agency Name' : 'Nom de l\'agence'}
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={isEnglish ? 'Enter agency name' : 'Entrez le nom de l\'agence'}
                  value={editAgent.agency_name}
                  onChangeText={(text) => setEditAgent({ ...editAgent, agency_name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {isEnglish ? 'License Number' : 'Numéro de licence'}
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="AGT-XXXX-XXX"
                  autoCapitalize="characters"
                  value={editAgent.license_number}
                  onChangeText={(text) => setEditAgent({ ...editAgent, license_number: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {isEnglish ? 'Bio' : 'Biographie'}
                </Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder={isEnglish ? 'Enter agent bio' : 'Entrez la biographie de l\'agent'}
                  multiline
                  numberOfLines={4}
                  value={editAgent.bio}
                  onChangeText={(text) => setEditAgent({ ...editAgent, bio: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {isEnglish ? 'Specializations (comma separated)' : 'Spécialisations (séparées par des virgules)'}
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={isEnglish ? 'e.g., Residential, Commercial' : 'ex: Résidentiel, Commercial'}
                  value={editAgent.specializations.join(', ')}
                  onChangeText={(text) => {
                    const specs = text.split(',').map(s => s.trim()).filter(s => s.length > 0);
                    setEditAgent({ ...editAgent, specializations: specs });
                  }}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {isEnglish ? 'Regions (comma separated)' : 'Régions (séparées par des virgules)'}
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={isEnglish ? 'e.g., Kinshasa, Lubumbashi' : 'ex: Kinshasa, Lubumbashi'}
                  value={editAgent.regions.join(', ')}
                  onChangeText={(text) => {
                    const regions = text.split(',').map(r => r.trim()).filter(r => r.length > 0);
                    setEditAgent({ ...editAgent, regions });
                  }}
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, updatingAgent && styles.submitButtonDisabled]} 
                onPress={updateAgentProfile}
                disabled={updatingAgent}
              >
                {updatingAgent ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isEnglish ? 'Update Agent' : 'Mettre à jour l\'agent'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  filterContainer: {
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  filterChipBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  filterChipBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterChipBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipBadgeTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: SIZES.screenPadding,
    paddingBottom: 100,
  },
  agentCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.card,
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  agentAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  agentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  agentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  agentAgency: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  agentLicense: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeInactive: {
    backgroundColor: '#FFEBEE',
  },
  statusBadgePending: {
    backgroundColor: '#FFF3E0',
  },
  statusBadgeSuspended: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },
  statusBadgeTextInactive: {
    color: COLORS.error,
  },
  statusBadgeTextPending: {
    color: '#FF9800',
  },
  statusBadgeTextSuspended: {
    color: COLORS.error,
  },
  agentStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  agentStat: {
    flex: 1,
    alignItems: 'center',
  },
  agentStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  agentStatLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  agentStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.borderLight,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  regionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 6,
  },
  regionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  regionTagText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalProfile: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  modalName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalAgency: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  modalBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedBadgeText: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '500',
  },
  modalStatusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalStatusBadgeInactive: {
    backgroundColor: '#FFEBEE',
  },
  modalStatusBadgeSuspended: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  modalStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },
  modalStatusTextInactive: {
    color: COLORS.error,
  },
  modalSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    width: '47%',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: 16,
    alignItems: 'center',
  },
  statBoxValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statBoxLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specTag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specTagText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  regionTagLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  regionTagLargeText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  modalActions: {
    padding: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    gap: 8,
    marginBottom: 12,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  viewPropertiesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    gap: 8,
    marginBottom: 12,
  },
  viewPropertiesText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    gap: 8,
    marginBottom: 12,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
  },
  suspendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    marginTop: 12,
    gap: 8,
  },
  suspendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  unsuspendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    marginTop: 12,
    gap: 8,
  },
  unsuspendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  suspendedWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: SIZES.radius,
    marginTop: 12,
    gap: 8,
  },
  suspendedReason: {
    flex: 1,
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '500',
  },
  modalScroll: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalSectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 18,
  },
  formGroup: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  avatarSelector: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  avatarPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  avatarPlaceholderText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  removeAvatarButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 2,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  agentAvatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentAvatarText: {
    fontSize: 20,
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

export default AdminAgentsScreen;

