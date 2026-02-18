// Niumba - Push Notification Service
// Note: Full push notifications require a development build, not Expo Go
import { Platform } from 'react-native';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Check environment BEFORE loading modules to avoid Expo Go errors
let Constants: any = null;
let isExpoGo = false;

try {
  Constants = require('expo-constants');
  isExpoGo = Constants?.default?.appOwnership === 'expo';
} catch (error) {
  // Constants not available
}

// Safe imports with fallbacks - Only load if NOT in Expo Go
let Notifications: any = null;
let Device: any = null;

// Only load expo-notifications if NOT in Expo Go (avoids SDK 53+ error)
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    Device = require('expo-device');
  } catch (error) {
    // Module not available - expected in some environments
    console.log('Notification modules not available');
  }
} else {
  // In Expo Go, notifications are not supported - silent mode
  console.log('Running in Expo Go - Push notifications disabled (requires development build)');
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  title_en: string | null;
  body: string;
  body_en: string | null;
  data: Record<string, any> | null;
  is_read: boolean;
  created_at: string;
}

// Check if notifications are available
const isNotificationsAvailable = Notifications !== null;

// Configure notification behavior (safe setup)
const setupNotificationHandler = () => {
  if (!isNotificationsAvailable) return;
  
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false, // Badge can cause issues in Expo Go
      }),
    });
  } catch (error) {
    // Silent fail - expected in some environments
  }
};

// Initialize on load
setupNotificationHandler();

// Register for push notifications
export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!isNotificationsAvailable) {
    console.log('Notifications not available');
    return null;
  }

  try {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }

    // Set up Android channel
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Niumba',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#006AFF',
        });
      } catch (e) {
        // Channel setup failed, continue anyway
      }
    }

    // In Expo Go, we can't get push tokens
    if (isExpoGo) {
      return 'local-notifications-only';
    }

    // Try to get push token (only works in dev builds)
    try {
      const projectId = Constants?.default?.expoConfig?.extra?.eas?.projectId;
      if (projectId) {
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        return tokenData.data;
      }
    } catch (e) {
      // Expected to fail in Expo Go
    }

    return 'local-notifications-only';
  } catch (error) {
    console.log('registerForPushNotifications error:', error);
    return null;
  }
};

// Save push token to user profile
export const savePushToken = async (userId: string, token: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, push token not saved');
    return;
  }

  try {
    await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', userId);
  } catch (error) {
    console.error('Error saving push token:', error);
  }
};

// Schedule local notification (safe version)
export const scheduleLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<string | null> => {
  if (!isNotificationsAvailable) return null;

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null, // Immediate
    });
    return notificationId;
  } catch (error) {
    console.log('scheduleLocalNotification error:', error);
    return null;
  }
};

// Send notification for new property
export const notifyNewProperty = async (
  propertyTitle: string,
  city: string
): Promise<void> => {
  await scheduleLocalNotification(
    'Nouvelle propriété disponible !',
    `${propertyTitle} à ${city}`,
    { type: 'new_property' }
  );
};

// Send notification for inquiry response
export const notifyInquiryResponse = async (
  propertyTitle: string
): Promise<void> => {
  await scheduleLocalNotification(
    'Réponse à votre demande',
    `Le propriétaire de "${propertyTitle}" a répondu`,
    { type: 'inquiry_response' }
  );
};

// Send notification for price drop
export const notifyPriceDrop = async (
  propertyTitle: string,
  newPrice: number
): Promise<void> => {
  await scheduleLocalNotification(
    'Baisse de prix ! 📉',
    `${propertyTitle} est maintenant à $${newPrice.toLocaleString()}`,
    { type: 'price_drop' }
  );
};

// Send notification for appointment
export const notifyAppointment = async (
  propertyTitle: string,
  date: string,
  time: string
): Promise<void> => {
  await scheduleLocalNotification(
    'Rendez-vous confirmé ✓',
    `Visite de "${propertyTitle}" le ${date} à ${time}`,
    { type: 'appointment' }
  );
};

// Send notification for new message
export const notifyNewMessage = async (
  senderName: string
): Promise<void> => {
  await scheduleLocalNotification(
    'Nouveau message 💬',
    `${senderName} vous a envoyé un message`,
    { type: 'message' }
  );
};

// Cancel all notifications (safe version)
export const cancelAllNotifications = async (): Promise<void> => {
  if (!isNotificationsAvailable) return;
  
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    // Silent fail
  }
};

// Cancel specific notification
export const cancelNotification = async (notificationId: string): Promise<void> => {
  if (!isNotificationsAvailable) return;
  
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    // Silent fail
  }
};

// Get notification permissions status (safe version)
export const getNotificationPermissions = async (): Promise<boolean> => {
  if (!isNotificationsAvailable) return false;
  
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    return false;
  }
};

// Add notification listener (safe version)
export const addNotificationListener = (
  callback: (notification: any) => void
) => {
  if (!isNotificationsAvailable) return { remove: () => {} };
  
  try {
    return Notifications.addNotificationReceivedListener(callback);
  } catch (error) {
    return { remove: () => {} };
  }
};

// Add notification response listener (safe version)
export const addNotificationResponseListener = (
  callback: (response: any) => void
) => {
  if (!isNotificationsAvailable) return { remove: () => {} };
  
  try {
    return Notifications.addNotificationResponseReceivedListener(callback);
  } catch (error) {
    return { remove: () => {} };
  }
};

// Get badge count (safe version)
export const getBadgeCount = async (): Promise<number> => {
  if (!isNotificationsAvailable) return 0;
  
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    return 0;
  }
};

// Set badge count (safe version)
export const setBadgeCount = async (count: number): Promise<void> => {
  if (!isNotificationsAvailable) return;
  
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    // Silent fail - badge not supported in Expo Go
  }
};

// Check if notifications are available
export const isAvailable = (): boolean => {
  return isNotificationsAvailable;
};

// Check if running in Expo Go
export const isRunningInExpoGo = (): boolean => {
  return isExpoGo;
};

// ============================================
// SUPABASE NOTIFICATIONS
// ============================================

/**
 * Get notifications for a user from Supabase
 */
export const getUserNotifications = async (
  userId: string,
  options: {
    unreadOnly?: boolean;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{ data: Notification[]; count: number }> => {
  const { unreadOnly = false, page = 0, pageSize = 20 } = options;

  if (!isSupabaseConfigured()) {
    return { data: [], count: 0 };
  }

  try {
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: (data || []) as Notification[],
      count: count || 0,
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { data: [], count: 0 };
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  if (!isSupabaseConfigured()) return 0;

  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
      })
      .eq('id', notificationId)
      .eq('user_id', userId); // Ensure user owns the notification

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (
  userId: string
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
  notificationId: string,
  userId: string
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
};

/**
 * Delete all notifications for a user
 */
export const deleteAllNotifications = async (
  userId: string
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    return false;
  }
};

/**
 * Subscribe to new notifications for a user
 */
export const subscribeToNotifications = (
  userId: string,
  callback: (notification: Notification) => void
): RealtimeChannel => {
  if (!isSupabaseConfigured()) {
    return {} as RealtimeChannel;
  }

  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Notification);
        
        // Show local notification if app is in background
        if (isNotificationsAvailable) {
          scheduleLocalNotification(
            payload.new.title,
            payload.new.body,
            payload.new.data || {}
          );
        }
      }
    )
    .subscribe();

  return channel;
};

export default {
  registerForPushNotifications,
  savePushToken,
  scheduleLocalNotification,
  notifyNewProperty,
  notifyInquiryResponse,
  notifyPriceDrop,
  notifyAppointment,
  notifyNewMessage,
  cancelAllNotifications,
  cancelNotification,
  getNotificationPermissions,
  addNotificationListener,
  addNotificationResponseListener,
  getBadgeCount,
  setBadgeCount,
  isAvailable,
  isRunningInExpoGo,
  // Supabase functions
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  subscribeToNotifications,
};
