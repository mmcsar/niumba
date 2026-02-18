// Niumba - Conversations List Screen
// COMPTE REQUIS - Les utilisateurs doivent être connectés
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useChat';
import LoginRequired from '../components/LoginRequired';

const ConversationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const { conversations, loading, error, loadConversations } = useChat();
  const isEnglish = i18n.language === 'en';
  
  // COMPTE REQUIS: Vérification de l'authentification
  if (!user) {
    return (
      <LoginRequired 
        navigation={navigation}
        icon="chatbubbles"
        title={{ 
          fr: 'Vos conversations', 
          en: 'Your Conversations' 
        }}
        subtitle={{ 
          fr: 'Connectez-vous pour envoyer des messages aux propriétaires et agents.', 
          en: 'Sign in to message property owners and agents.' 
        }}
      />
    );
  }

  // Format timestamp
  const formatTimestamp = (dateString: string | null): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return isEnglish ? 'Just now' : 'À l\'instant';
    if (diffMins < 60) return `${diffMins}${isEnglish ? 'm' : 'min'}`;
    if (diffHours < 24) return `${diffHours}${isEnglish ? 'h' : 'h'}`;
    if (diffDays === 1) return isEnglish ? 'Yesterday' : 'Hier';
    if (diffDays < 7) return date.toLocaleDateString(isEnglish ? 'en-US' : 'fr-FR', { weekday: 'short' });
    return date.toLocaleDateString(isEnglish ? 'en-US' : 'fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const renderConversation = ({ item }: { item: typeof conversations[0] }) => {
    const otherParticipant = item.other_participant;
    const participantName = otherParticipant?.full_name || 'Unknown';
    const participantAvatar = otherParticipant?.avatar_url || undefined;
    const lastMessage = item.last_message;
    const hasUnread = lastMessage && lastMessage.sender_id !== user?.id && lastMessage.status !== 'read';

    return (
      <TouchableOpacity
        style={styles.conversationCard}
        onPress={() => {
          const otherUserId = item.participant_1 === user?.id ? item.participant_2 : item.participant_1;
          navigation.navigate('Chat', {
            conversationId: item.id,
            recipientId: otherUserId,
            recipientName: participantName,
            recipientAvatar: participantAvatar,
            propertyId: item.property_id || undefined,
            propertyTitle: item.property?.title || undefined,
          });
        }}
      >
        {/* Avatar */}
        {participantAvatar ? (
          <Image source={{ uri: participantAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {participantName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {/* Content */}
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.recipientName, hasUnread && styles.unreadName]}>
              {participantName}
            </Text>
            <Text style={[styles.timestamp, hasUnread && styles.unreadTimestamp]}>
              {formatTimestamp(item.last_message_at)}
            </Text>
          </View>
          
          {item.property?.title && (
            <View style={styles.propertyTag}>
              <Ionicons name="home-outline" size={12} color={COLORS.primary} />
              <Text style={styles.propertyTagText} numberOfLines={1}>
                {item.property.title}
              </Text>
            </View>
          )}
          
          <Text 
            style={[styles.lastMessage, hasUnread && styles.unreadMessage]} 
            numberOfLines={1}
          >
            {item.last_message_preview || lastMessage?.content || (isEnglish ? 'No messages yet' : 'Aucun message')}
          </Text>
        </View>

        {/* Unread Badge */}
        {hasUnread && (
          <View style={styles.unreadBadge}>
            <View style={styles.unreadDot} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEnglish ? 'Messages' : 'Messages'}</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search-outline" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadConversations} style={styles.retryButton}>
            <Text style={styles.retryText}>{isEnglish ? 'Retry' : 'Réessayer'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading State */}
      {loading && conversations.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        /* Conversations List */
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadConversations}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>
                {isEnglish ? 'No messages yet' : 'Aucun message'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {isEnglish 
                  ? 'Start a conversation by contacting a property owner'
                  : 'Commencez une conversation en contactant un propriétaire'}
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
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingVertical: 8,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.white,
  },
  conversationContent: {
    flex: 1,
    marginLeft: 14,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  unreadName: {
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  unreadTimestamp: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  propertyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  propertyTagText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  unreadMessage: {
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ConversationsScreen;

