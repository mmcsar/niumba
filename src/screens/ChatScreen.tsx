// Niumba - Chat/Messaging Screen
// COMPTE REQUIS - Les utilisateurs doivent être connectés
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useChat';
import { getConversations } from '../services/chatService';
import LoginRequired from '../components/LoginRequired';

interface ChatScreenProps {
  navigation: any;
  route: {
    params: {
      conversationId?: string;
      recipientId?: string;
      recipientName: string;
      recipientAvatar?: string;
      propertyId?: string;
      propertyTitle?: string;
    };
  };
}

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { conversationId, recipientId, recipientName, recipientAvatar, propertyId, propertyTitle } = route.params;
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const { 
    messages, 
    loading, 
    sending, 
    error,
    activeConversation,
    setActiveConversation,
    startConversation,
    sendMessage: sendChatMessage,
    loadMessages,
  } = useChat();
  const isEnglish = i18n.language === 'en';
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState('');
  
  // COMPTE REQUIS: Vérification de l'authentification
  if (!user) {
    return (
      <LoginRequired 
        navigation={navigation}
        icon="chatbubble-ellipses"
        title={{ 
          fr: 'Envoyer un message', 
          en: 'Send Message' 
        }}
        subtitle={{ 
          fr: 'Connectez-vous pour discuter avec le propriétaire.', 
          en: 'Sign in to chat with the property owner.' 
        }}
      />
    );
  }

  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      if (conversationId) {
        // Load existing conversation
        await loadMessages(conversationId);
      } else if (recipientId) {
        // Start new conversation
        const conversation = await startConversation(recipientId, propertyId);
        if (conversation) {
          setActiveConversation(conversation);
        }
      }
    };

    initConversation();
  }, [conversationId, recipientId, propertyId, startConversation, loadMessages, setActiveConversation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || !activeConversation) return;

    const message = await sendChatMessage(inputText.trim());
    if (message) {
      setInputText('');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const today = new Date();
    const messageDate = new Date(dateString);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return isEnglish ? 'Today' : "Aujourd'hui";
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return isEnglish ? 'Yesterday' : 'Hier';
    }
    
    return messageDate.toLocaleDateString();
  };

  const renderMessage = ({ item, index }: { item: typeof messages[0]; index: number }) => {
    const isOwn = item.sender_id === user?.id;
    const showDate = index === 0 || 
      formatDate(messages[index - 1].created_at) !== formatDate(item.created_at);
    const senderAvatar = item.sender?.avatar_url;
    const senderName = item.sender?.full_name || 'Unknown';

    return (
      <View>
        {showDate && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
          </View>
        )}
        <View style={[styles.messageContainer, isOwn && styles.ownMessageContainer]}>
          {!isOwn && (
            <View style={styles.avatarContainer}>
              {senderAvatar ? (
                <Image source={{ uri: senderAvatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {senderName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          )}
          <View style={[styles.messageBubble, isOwn && styles.ownMessageBubble]}>
            <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
              {item.content}
            </Text>
            {item.attachment_url && (
              <Image source={{ uri: item.attachment_url }} style={styles.attachmentImage} />
            )}
            <View style={styles.messageFooter}>
              <Text style={[styles.messageTime, isOwn && styles.ownMessageTime]}>
                {formatTime(item.created_at)}
              </Text>
              {isOwn && (
                <Ionicons 
                  name={item.status === 'read' ? 'checkmark-done' : 'checkmark'} 
                  size={14} 
                  color={item.status === 'read' ? COLORS.success : COLORS.white} 
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerInfo}>
          {recipientAvatar ? (
            <Image source={{ uri: recipientAvatar }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Ionicons name="person" size={20} color={COLORS.textLight} />
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.headerName}>{recipientName}</Text>
            <Text style={styles.headerStatus}>
              {isEnglish ? 'Online' : 'En ligne'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="call-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Property Context */}
      {propertyTitle && (
        <TouchableOpacity 
          style={styles.propertyContext}
          onPress={() => propertyId && navigation.navigate('PropertyDetail', { propertyId })}
        >
          <Ionicons name="home-outline" size={16} color={COLORS.primary} />
          <Text style={styles.propertyContextText} numberOfLines={1}>
            {propertyTitle}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
        </TouchableOpacity>
      )}

      {/* Loading State */}
      {loading && messages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        /* Messages */
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyText}>
                {isEnglish ? 'No messages yet' : 'Aucun message'}
              </Text>
            </View>
          }
        />
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder={isEnglish ? 'Type a message...' : 'Écrivez un message...'}
              placeholderTextColor={COLORS.textLight}
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={styles.emojiButton}>
              <Ionicons name="happy-outline" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || sending || !activeConversation}
          >
            {sending ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons 
                name="send" 
                size={20} 
                color={inputText.trim() ? COLORS.white : COLORS.textLight} 
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  headerStatus: {
    fontSize: 12,
    color: COLORS.success,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyContext: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  propertyContextText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textLight,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    flexDirection: 'row-reverse',
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    ...SHADOWS.small,
  },
  ownMessageBubble: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  ownMessageText: {
    color: COLORS.white,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  ownMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    ...SHADOWS.small,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textLight,
    marginHorizontal: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 4,
    maxHeight: 100,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.textPrimary,
    maxHeight: 80,
  },
  emojiButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: COLORS.errorLight,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },
  attachmentImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default ChatScreen;

