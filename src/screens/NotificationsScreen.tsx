// Niumba - Notifications Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../context/AuthContext';
import LoginRequired from '../components/LoginRequired';

interface NotificationsScreenProps {
  navigation: any;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    markAsRead,
    markAllAsRead,
    remove,
    loadMore,
    refresh,
  } = useNotifications();
  const isEnglish = i18n.language === 'en';

  // COMPTE REQUIS: Vérification de l'authentification
  if (!user) {
    return (
      <LoginRequired 
        navigation={navigation}
        icon="notifications"
        title={{ 
          fr: 'Vos notifications', 
          en: 'Your Notifications' 
        }}
        subtitle={{ 
          fr: 'Connectez-vous pour voir vos notifications.', 
          en: 'Sign in to view your notifications.' 
        }}
      />
    );
  }

  const onRefresh = () => {
    refresh();
  };

  const handleNotificationPress = async (notification: typeof notifications[0]) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    const data = notification.data as any;
    switch (notification.type) {
      case 'property':
      case 'price_drop':
        if (data?.property_id) {
          navigation.navigate('PropertyDetail', { propertyId: data.property_id });
        }
        break;
      case 'message':
        if (data?.conversation_id) {
          navigation.navigate('Chat', { conversationId: data.conversation_id });
        }
        break;
      case 'appointment':
      case 'appointment_update':
        // Navigate to admin appointments if user is admin, otherwise show message
        if (data?.appointment_id) {
          // Try to navigate to admin appointments or show appointment details
          navigation.navigate('AdminAppointments');
        } else {
          // Fallback: navigate to profile or show message
          navigation.navigate('Profile');
        }
        break;
      case 'inquiry':
      case 'inquiry_response':
        if (data?.property_id) {
          navigation.navigate('PropertyDetail', { propertyId: data.property_id });
        }
        break;
      case 'alert':
        navigation.navigate('Alerts');
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'property': return 'home';
      case 'message': return 'chatbubble';
      case 'appointment': return 'calendar';
      case 'price_drop': return 'trending-down';
      case 'inquiry': return 'mail';
      case 'alert': return 'notifications';
      case 'system': return 'information-circle';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'property': return COLORS.primary;
      case 'message': return '#5856D6';
      case 'appointment': return COLORS.success;
      case 'price_drop': return '#FF3B30';
      case 'inquiry': return '#FF9500';
      case 'alert': return '#007AFF';
      case 'system': return COLORS.textSecondary;
      default: return COLORS.primary;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return isEnglish ? 'Just now' : 'À l\'instant';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}${isEnglish ? 'd' : 'j'}`;
    return date.toLocaleDateString();
  };

  const NotificationItem: React.FC<{ notification: typeof notifications[0] }> = ({ notification }) => {
    const iconName = getNotificationIcon(notification.type);
    const iconColor = getNotificationColor(notification.type);
    const title = isEnglish && notification.title_en ? notification.title_en : notification.title;
    const body = isEnglish && notification.body_en ? notification.body_en : notification.body;

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !notification.is_read && styles.notificationItemUnread,
        ]}
        onPress={() => handleNotificationPress(notification)}
        activeOpacity={0.7}
      >
        {/* Icon */}
        <View style={[styles.notificationIcon, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={iconName as any} size={22} color={iconColor} />
        </View>

        {/* Content */}
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={[
              styles.notificationTitle,
              !notification.is_read && styles.notificationTitleUnread,
            ]} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.notificationTime}>
              {formatTime(notification.created_at)}
            </Text>
          </View>
          <Text style={styles.notificationBody} numberOfLines={2}>
            {body}
          </Text>
        </View>

        {/* Unread indicator */}
        {!notification.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = (title: string, showMarkAll: boolean = false) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {showMarkAll && unreadCount > 0 && (
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={styles.markAllText}>
            {isEnglish ? 'Mark all read' : 'Tout marquer lu'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Group notifications by time
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayNotifications = notifications.filter(n => new Date(n.created_at) >= today);
  const yesterdayNotifications = notifications.filter(n => {
    const date = new Date(n.created_at);
    return date >= yesterday && date < today;
  });
  const olderNotifications = notifications.filter(n => new Date(n.created_at) < yesterday);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {isEnglish ? 'Notifications' : 'Notifications'}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('NotificationSettings')}>
          <Ionicons name="settings-outline" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="notifications-off-outline" size={64} color={COLORS.textLight} />
          </View>
          <Text style={styles.emptyTitle}>
            {isEnglish ? 'No notifications' : 'Aucune notification'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {isEnglish 
              ? 'You\'re all caught up! New notifications will appear here.'
              : 'Vous êtes à jour ! Les nouvelles notifications apparaîtront ici.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={[
            ...(todayNotifications.length > 0 ? [{ type: 'header', title: isEnglish ? 'Today' : 'Aujourd\'hui', showMarkAll: true }] : []),
            ...todayNotifications,
            ...(yesterdayNotifications.length > 0 ? [{ type: 'header', title: isEnglish ? 'Yesterday' : 'Hier' }] : []),
            ...yesterdayNotifications,
            ...(olderNotifications.length > 0 ? [{ type: 'header', title: isEnglish ? 'Earlier' : 'Plus ancien' }] : []),
            ...olderNotifications,
          ]}
          keyExtractor={(item, index) => (item as any).id || `header-${index}`}
          renderItem={({ item }) => {
            if ((item as any).type === 'header') {
              return renderSectionHeader((item as any).title, (item as any).showMarkAll);
            }
            return <NotificationItem notification={item as typeof notifications[0]} />;
          }}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          onEndReached={() => {
            if (hasMore && !loading) {
              loadMore();
            }
          }}
          onEndReachedThreshold={0.5}
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  unreadBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  markAllText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  notificationItemUnread: {
    backgroundColor: '#F0F7FF',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  notificationTitleUnread: {
    fontWeight: '700',
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  notificationBody: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
});

export default NotificationsScreen;

