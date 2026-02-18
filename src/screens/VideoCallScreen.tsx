// Niumba - Video Call Screen
// Écran pour gérer et lancer les appels vidéo
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { getVideoCallByAppointment, getOrCreateVideoCall, startVideoCall, endVideoCall } from '../services/videoCallService';
import { getAppointmentById } from '../services/appointmentService';

interface VideoCallScreenProps {
  navigation: any;
  route: {
    params: {
      appointmentId: string;
    };
  };
}

const VideoCallScreen: React.FC<VideoCallScreenProps> = ({ navigation, route }) => {
  const { appointmentId } = route.params;
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const isEnglish = i18n.language === 'en';

  const [loading, setLoading] = useState(true);
  const [videoCall, setVideoCall] = useState<any>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [callActive, setCallActive] = useState(false);

  useEffect(() => {
    loadData();
  }, [appointmentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load appointment
      const apt = await getAppointmentById(appointmentId);
      setAppointment(apt);

      // Get or create video call
      const vc = await getOrCreateVideoCall(appointmentId);
      setVideoCall(vc);
      setCallActive(vc?.status === 'active');
    } catch (error) {
      console.error('Error loading video call data:', error);
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Failed to load video call information' : 'Échec du chargement des informations d\'appel vidéo'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartCall = async () => {
    if (!videoCall) return;

    try {
      // Start the call
      const success = await startVideoCall(videoCall.id);
      if (success) {
        setCallActive(true);
        setVideoCall({ ...videoCall, status: 'active' });
      }

      // Open the meeting URL
      const url = videoCall.meeting_url;
      
      // Check if it's a custom URL (niumba://) or external URL
      if (url.startsWith('niumba://')) {
        // For custom URLs, you can implement your own WebRTC solution here
        Alert.alert(
          isEnglish ? 'Video Call' : 'Appel vidéo',
          isEnglish 
            ? 'Custom video call implementation required. Meeting ID: ' + videoCall.meeting_id
            : 'Implémentation d\'appel vidéo personnalisée requise. ID de réunion : ' + videoCall.meeting_id,
          [
            {
              text: isEnglish ? 'OK' : 'OK',
              onPress: () => {},
            },
          ]
        );
      } else {
        // Open external URL (Zoom, Google Meet, etc.)
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert(
            isEnglish ? 'Error' : 'Erreur',
            isEnglish ? 'Cannot open video call link' : 'Impossible d\'ouvrir le lien d\'appel vidéo'
          );
        }
      }
    } catch (error) {
      console.error('Error starting call:', error);
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Failed to start video call' : 'Échec du démarrage de l\'appel vidéo'
      );
    }
  };

  const handleEndCall = async () => {
    if (!videoCall) return;

    Alert.alert(
      isEnglish ? 'End Call' : 'Terminer l\'appel',
      isEnglish ? 'Are you sure you want to end this call?' : 'Êtes-vous sûr de vouloir terminer cet appel ?',
      [
        {
          text: isEnglish ? 'Cancel' : 'Annuler',
          style: 'cancel',
        },
        {
          text: isEnglish ? 'End Call' : 'Terminer',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await endVideoCall(videoCall.id);
              if (success) {
                setCallActive(false);
                setVideoCall({ ...videoCall, status: 'completed' });
                Alert.alert(
                  isEnglish ? 'Call Ended' : 'Appel terminé',
                  isEnglish ? 'The video call has been ended.' : 'L\'appel vidéo a été terminé.'
                );
              }
            } catch (error) {
              console.error('Error ending call:', error);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isEnglish ? 'en-US' : 'fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {isEnglish ? 'Loading...' : 'Chargement...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!videoCall || !appointment) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.errorContainer}>
          <Ionicons name="videocam-off" size={64} color={COLORS.textLight} />
          <Text style={styles.errorText}>
            {isEnglish ? 'Video call not found' : 'Appel vidéo introuvable'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadData}
          >
            <Text style={styles.retryButtonText}>
              {isEnglish ? 'Retry' : 'Réessayer'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const otherUser = appointment.client_id === user?.id 
    ? appointment.agent 
    : appointment.client;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEnglish ? 'Video Call' : 'Appel vidéo'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Appointment Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>
              {formatDate(appointment.appointment_date)} à {appointment.appointment_time}
            </Text>
          </View>

          {appointment.property && (
            <View style={styles.infoRow}>
            <Ionicons name="home-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoText} numberOfLines={2}>
              {appointment.property.title}
            </Text>
          </View>
          )}

          {otherUser && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>
                {isEnglish ? 'With' : 'Avec'} {otherUser.full_name}
              </Text>
            </View>
          )}
        </View>

        {/* Meeting Info */}
        <View style={styles.meetingCard}>
          <Text style={styles.meetingTitle}>
            {isEnglish ? 'Meeting Information' : 'Informations de la réunion'}
          </Text>
          <View style={styles.meetingInfo}>
            <Text style={styles.meetingLabel}>
              {isEnglish ? 'Meeting ID' : 'ID de réunion'}
            </Text>
            <Text style={styles.meetingValue}>{videoCall.meeting_id}</Text>
          </View>
          {videoCall.meeting_password && (
            <View style={styles.meetingInfo}>
              <Text style={styles.meetingLabel}>
                {isEnglish ? 'Password' : 'Mot de passe'}
              </Text>
              <Text style={styles.meetingValue}>{videoCall.meeting_password}</Text>
            </View>
          )}
          <View style={styles.meetingInfo}>
            <Text style={styles.meetingLabel}>
              {isEnglish ? 'Status' : 'Statut'}
            </Text>
            <Text style={[
              styles.meetingValue,
              callActive && styles.statusActive
            ]}>
              {callActive 
                ? (isEnglish ? 'Active' : 'Actif')
                : (isEnglish ? 'Scheduled' : 'Planifié')}
            </Text>
          </View>
        </View>

        {/* Call Actions */}
        <View style={styles.actionsContainer}>
          {!callActive ? (
            <TouchableOpacity
              style={[styles.callButton, styles.startButton]}
              onPress={handleStartCall}
            >
              <Ionicons name="videocam" size={24} color={COLORS.white} />
              <Text style={styles.callButtonText}>
                {isEnglish ? 'Start Video Call' : 'Démarrer l\'appel vidéo'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.callButton, styles.endButton]}
              onPress={handleEndCall}
            >
              <Ionicons name="call" size={24} color={COLORS.white} />
              <Text style={styles.callButtonText}>
                {isEnglish ? 'End Call' : 'Terminer l\'appel'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => {
              // Copy meeting ID to clipboard
              // You can use expo-clipboard here
              Alert.alert(
                isEnglish ? 'Copied' : 'Copié',
                isEnglish ? 'Meeting ID copied to clipboard' : 'ID de réunion copié dans le presse-papiers'
              );
            }}
          >
            <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
            <Text style={styles.copyButtonText}>
              {isEnglish ? 'Copy Meeting ID' : 'Copier l\'ID de réunion'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
  content: {
    flex: 1,
    padding: SIZES.screenPadding,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.screenPadding,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  meetingCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: 16,
    marginBottom: 24,
    ...SHADOWS.card,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  meetingInfo: {
    marginBottom: 12,
  },
  meetingLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  meetingValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statusActive: {
    color: COLORS.success,
  },
  actionsContainer: {
    gap: 12,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    gap: 8,
  },
  startButton: {
    backgroundColor: COLORS.primary,
  },
  endButton: {
    backgroundColor: COLORS.error,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 8,
  },
  copyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default VideoCallScreen;


