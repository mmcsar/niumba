// Niumba - Chat Hook
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage as sendChatMessage,
  markMessagesAsRead,
  subscribeToMessages,
  subscribeToConversations,
  deleteMessage,
  uploadChatAttachment,
  type Message,
  type Conversation,
} from '../services/chatService';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const messagesChannelRef = useRef<RealtimeChannel | null>(null);
  const conversationsChannelRef = useRef<RealtimeChannel | null>(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getConversations(user.id);
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string, before?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMessages(conversationId, 50, before);
      if (before) {
        setMessages((prev) => [...data, ...prev]);
      } else {
        setMessages(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  }, []);

  // Start or get conversation
  const startConversation = useCallback(async (
    otherUserId: string,
    propertyId?: string
  ): Promise<Conversation | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      const conversation = await getOrCreateConversation(user.id, otherUserId, propertyId);
      if (conversation) {
        setActiveConversation(conversation);
        await loadMessages(conversation.id);
      }
      return conversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la conversation');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, loadMessages]);

  // Send a message
  const sendMessage = useCallback(async (
    content: string,
    messageType: 'text' | 'image' | 'file' | 'location' = 'text',
    attachmentUrl?: string
  ): Promise<Message | null> => {
    if (!user || !activeConversation) return null;

    try {
      setSending(true);
      const message = await sendChatMessage(
        activeConversation.id,
        user.id,
        content,
        messageType,
        attachmentUrl
      );

      if (message) {
        setMessages((prev) => [...prev, message]);
        // Update conversation in list
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversation.id
              ? { ...conv, last_message_at: message.created_at, last_message_preview: content.substring(0, 100) }
              : conv
          )
        );
      }

      return message;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du message');
      return null;
    } finally {
      setSending(false);
    }
  }, [user, activeConversation]);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!user || !activeConversation) return;

    try {
      await markMessagesAsRead(activeConversation.id, user.id);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender_id !== user.id && msg.status !== 'read'
            ? { ...msg, status: 'read' }
            : msg
        )
      );
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [user, activeConversation]);

  // Delete a message
  const removeMessage = useCallback(async (messageId: string) => {
    try {
      const success = await deleteMessage(messageId);
      if (success) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du message');
      return false;
    }
  }, []);

  // Upload attachment
  const uploadAttachment = useCallback(async (
    fileUri: string,
    fileName: string
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      return await uploadChatAttachment(fileUri, user.id, fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload du fichier');
      return null;
    }
  }, [user]);

  // Subscribe to messages
  useEffect(() => {
    if (!activeConversation || !user) return;

    // Cleanup previous subscription
    if (messagesChannelRef.current) {
      messagesChannelRef.current.unsubscribe();
    }

    const channel = subscribeToMessages(activeConversation.id, (message) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    messagesChannelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [activeConversation, user]);

  // Subscribe to conversations
  useEffect(() => {
    if (!user) return;

    // Cleanup previous subscription
    if (conversationsChannelRef.current) {
      conversationsChannelRef.current.unsubscribe();
    }

    const channel = subscribeToConversations(user.id, (conversation) => {
      setConversations((prev) => {
        const existing = prev.find((c) => c.id === conversation.id);
        if (existing) {
          return prev.map((c) => (c.id === conversation.id ? conversation : c));
        }
        return [conversation, ...prev];
      });
    });

    conversationsChannelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  // Mark as read when conversation is active
  useEffect(() => {
    if (activeConversation && user) {
      markAsRead();
    }
  }, [activeConversation, user, markAsRead]);

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    error,
    sending,
    setActiveConversation,
    loadConversations,
    loadMessages,
    startConversation,
    sendMessage,
    markAsRead,
    removeMessage,
    uploadAttachment,
  };
};

// Hook for a single conversation
export const useConversation = (conversationId: string | null) => {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversation = useCallback(async () => {
    if (!conversationId || !user) return;

    try {
      setLoading(true);
      const conversations = await getConversations(user.id);
      const found = conversations.find((c) => c.id === conversationId);
      setConversation(found || null);

      if (found) {
        const msgs = await getMessages(found.id);
        setMessages(msgs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [conversationId, user]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  return {
    conversation,
    messages,
    loading,
    error,
    refetch: loadConversation,
  };
};

export default useChat;

