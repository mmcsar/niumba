// Niumba - Offline Banner Component
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useTranslation } from 'react-i18next';

interface OfflineBannerProps {
  isOffline: boolean;
  lastSyncTime?: Date | null;
  onRetry?: () => void;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline,
  lastSyncTime,
  onRetry,
}) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const slideAnim = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOffline ? 0 : -60,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOffline]);

  const formatLastSync = () => {
    if (!lastSyncTime) return '';
    
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) {
      return isEnglish ? 'just now' : 'à l\'instant';
    }
    if (minutes < 60) {
      return isEnglish ? `${minutes}m ago` : `il y a ${minutes}m`;
    }
    if (hours < 24) {
      return isEnglish ? `${hours}h ago` : `il y a ${hours}h`;
    }
    return lastSyncTime.toLocaleDateString();
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.content}>
        <Ionicons name="cloud-offline" size={20} color={COLORS.white} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isEnglish ? 'You\'re offline' : 'Vous êtes hors ligne'}
          </Text>
          {lastSyncTime && (
            <Text style={styles.subtitle}>
              {isEnglish ? 'Last sync: ' : 'Dernière sync: '}{formatLastSync()}
            </Text>
          )}
        </View>
      </View>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Ionicons name="refresh" size={18} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Account for status bar
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 12,
  },
  title: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  retryButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OfflineBanner;

