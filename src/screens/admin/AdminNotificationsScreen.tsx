// Niumba - Admin Notifications Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

interface Notification {
  id: string;
  type: 'inquiry' | 'property' | 'user' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const AdminNotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const [notifications] = useState<Notification[]>([
    { id: '1', type: 'inquiry', title: isEnglish ? 'New Inquiry' : 'Nouvelle demande', message: 'Jean Kabila is interested in Villa Moderne', read: false, created_at: '2024-01-25T10:30:00' },
    { id: '2', type: 'property', title: isEnglish ? 'Property Submitted' : 'Propriété soumise', message: 'New property awaiting approval', read: false, created_at: '2024-01-25T09:15:00' },
    { id: '3', type: 'user', title: isEnglish ? 'New User' : 'Nouvel utilisateur', message: 'Marie Tshombe registered', read: true, created_at: '2024-01-24T14:00:00' },
    { id: '4', type: 'system', title: isEnglish ? 'System Update' : 'Mise à jour système', message: 'App version 1.1.0 available', read: true, created_at: '2024-01-23T08:00:00' },
  ]);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'inquiry': return 'chatbubble';
      case 'property': return 'home';
      case 'user': return 'person';
      case 'system': return 'settings';
      default: return 'notifications';
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'inquiry': return COLORS.primary;
      case 'property': return '#00A86B';
      case 'user': return '#5856D6';
      case 'system': return '#FF9500';
      default: return COLORS.textSecondary;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return isEnglish ? 'Just now' : 'À l\'instant';
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}${isEnglish ? 'd' : 'j'}`;
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
    >
      <View style={[styles.iconBox, { backgroundColor: getColorForType(item.type) + '15' }]}>
        <Ionicons 
          name={getIconForType(item.type) as any} 
          size={20} 
          color={getColorForType(item.type)} 
        />
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.time}>{formatTime(item.created_at)}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEnglish ? 'Notifications' : 'Notifications'}</Text>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="checkmark-done" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>
              {isEnglish ? 'No notifications' : 'Aucune notification'}
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
  list: {
    padding: SIZES.screenPadding,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 10,
    ...SHADOWS.card,
  },
  unreadCard: {
    backgroundColor: COLORS.primaryLight,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 8,
  },
  message: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
    marginTop: 6,
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
});

export default AdminNotificationsScreen;

