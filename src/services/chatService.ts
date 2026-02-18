// Niumba - Chat Service (Conversations & Messages)
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachment_type: string | null;
  attachment_url: string | null;
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
  read_at: string | null;
  sender?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export interface Conversation {
  id: string;
  property_id: string | null;
  participant_1: string;
  participant_2: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  created_at: string;
  property?: {
    id: string;
    title: string;
    images: string[];
  };
  other_participant?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  last_message?: Message;
}

/**
 * Get all conversations for the current user
 */
export const getConversations = async (userId: string): Promise<Conversation[]> => {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        property:properties(id, title, images)
      `)
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Get other participant info and last message for each conversation
    const conversationsWithParticipants = await Promise.all(
      (data || []).map(async (conv: any) => {
        const otherUserId = conv.participant_1 === userId 
          ? conv.participant_2 
          : conv.participant_1;

        const { data: otherUser } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', otherUserId)
          .single();

        // Get last message
        const { data: lastMsg } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!sender_id(id, full_name, avatar_url)
          `)
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...conv,
          other_participant: otherUser,
          last_message: lastMsg || undefined,
        };
      })
    );

    return conversationsWithParticipants as Conversation[];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

/**
 * Get or create a conversation between two users
 */
export const getOrCreateConversation = async (
  userId1: string,
  userId2: string,
  propertyId?: string
): Promise<Conversation | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(participant_1.eq.${userId1},participant_2.eq.${userId2}),and(participant_1.eq.${userId2},participant_2.eq.${userId1})`)
      .maybeSingle();

    if (existing) {
      return existing as Conversation;
    }

    // Create new conversation
    const { data, error } = await (supabase as any)
      .from('conversations')
      .insert({
        participant_1: userId1,
        participant_2: userId2,
        property_id: propertyId || null,
      })
      .select(`
        *,
        property:properties(id, title, images)
      `)
      .single();

    if (error) throw error;
    return data as Conversation;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
};

/**
 * Get messages for a conversation
 */
export const getMessages = async (
  conversationId: string,
  limit: number = 50,
  before?: string
): Promise<Message[]> => {
  if (!isSupabaseConfigured()) return [];

  try {
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).reverse() as Message[]; // Reverse to show oldest first
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

/**
 * Send a message
 */
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  messageType: 'text' | 'image' | 'file' | 'location' = 'text',
  attachmentUrl?: string
): Promise<Message | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await (supabase as any)
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        attachment_type: messageType !== 'text' ? messageType : null,
        attachment_url: attachmentUrl || null,
        status: 'sent',
      })
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    // Update conversation's last message
    const msg = data as Message;
    await (supabase as any)
      .from('conversations')
      .update({
        last_message_at: msg.created_at,
        last_message_preview: content.substring(0, 100),
      })
      .eq('id', conversationId);

    return data as Message;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  if (!isSupabaseConfigured()) return;

  try {
    // Update message status
    await (supabase as any)
      .from('messages')
      .update({ 
        status: 'read',
        read_at: new Date().toISOString(),
      })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .in('status', ['sent', 'delivered']);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

/**
 * Subscribe to new messages in a conversation
 */
export const subscribeToMessages = (
  conversationId: string,
  callback: (message: Message) => void
): RealtimeChannel => {
  if (!isSupabaseConfigured()) {
    return {} as RealtimeChannel;
  }

  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        // Fetch full message with sender info
        const { data } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!sender_id(id, full_name, avatar_url)
          `)
          .eq('id', payload.new.id)
          .single();

        if (data) {
          callback(data as Message);
        }
      }
    )
    .subscribe();

  return channel;
};

/**
 * Subscribe to conversation updates
 */
export const subscribeToConversations = (
  userId: string,
  callback: (conversation: Conversation) => void
): RealtimeChannel => {
  if (!isSupabaseConfigured()) {
    return {} as RealtimeChannel;
  }

  const channel = supabase
    .channel(`conversations:${userId}`)
      .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `participant_1=eq.${userId},participant_2=eq.${userId}`,
      },
      async (payload) => {
        // Fetch full conversation with relations
        const newPayload = payload.new as { id: string };
        const { data } = await supabase
          .from('conversations')
          .select(`
            *,
            property:properties(id, title, images)
          `)
          .eq('id', newPayload.id)
          .single();

        if (data) {
          callback(data as Conversation);
        }
      }
    )
    .subscribe();

  return channel;
};

/**
 * Delete a message
 */
export const deleteMessage = async (messageId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
};

/**
 * Upload file attachment for chat
 */
export const uploadChatAttachment = async (
  fileUri: string,
  userId: string,
  fileName: string
): Promise<string | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const filePath = `chat-attachments/${userId}/${Date.now()}_${fileName}`;
    
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(filePath, arrayBuffer, {
        contentType: blob.type,
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading chat attachment:', error);
    return null;
  }
};

export default {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToMessages,
  subscribeToConversations,
  deleteMessage,
  uploadChatAttachment,
};

