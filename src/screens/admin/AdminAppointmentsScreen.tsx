// Niumba - Admin Appointments Management Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useAppointments } from '../../hooks/useAppointments';
import { useAuth } from '../../context/AuthContext';
import { updateAppointmentStatus } from '../../services/appointmentService';
import type { Appointment } from '../../services/appointmentService';

interface AdminAppointmentsScreenProps {
  navigation: any;
}

const AdminAppointmentsScreen: React.FC<AdminAppointmentsScreenProps> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const isEnglish = i18n.language === 'en';

  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Use hook for appointments
  const { appointments, loading, error, refresh } = useAppointments({
    role: 'owner', // Admin sees all appointments as owner
    status: filterStatus === 'all' ? undefined : filterStatus,
  });

  // Type for transformed appointments
  type TransformedAppointment = {
    id: string;
    propertyId: string;
    propertyTitle: string;
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    agentName: string;
    date: string;
    time: string;
    visitType: 'in_person' | 'virtual';
    status: string;
    message?: string;
    createdAt: string;
  };

  // Transform appointments to match UI format
  const transformedAppointments: TransformedAppointment[] = appointments.map(apt => ({
    id: apt.id,
    propertyId: apt.property_id,
    propertyTitle: (apt.property as any)?.title || 'Unknown Property',
    clientName: (apt.client as any)?.full_name || 'Unknown Client',
    clientPhone: (apt.client as any)?.phone || '',
    clientEmail: (apt.client as any)?.email || '',
    agentName: (apt.agent as any)?.full_name || 'No Agent',
    date: apt.appointment_date,
    time: apt.appointment_time,
    visitType: (apt.appointment_type === 'in_person' ? 'in_person' : 'virtual') as 'in_person' | 'virtual',
    status: apt.status,
    message: apt.client_notes || apt.notes || undefined,
    createdAt: apt.created_at,
  }));

  const getFilteredAppointments = () => {
    if (filterStatus === 'all') return transformedAppointments;
    return transformedAppointments.filter(apt => apt.status === filterStatus);
  };

  const counts = {
    all: transformedAppointments.length,
    pending: transformedAppointments.filter(a => a.status === 'pending').length,
    confirmed: transformedAppointments.filter(a => a.status === 'confirmed').length,
    completed: transformedAppointments.filter(a => a.status === 'completed').length,
    cancelled: transformedAppointments.filter(a => a.status === 'cancelled').length,
  };

  const handleConfirm = (apt: TransformedAppointment) => {
    Alert.alert(
      isEnglish ? 'Confirm Appointment' : 'Confirmer le rendez-vous',
      isEnglish 
        ? `Confirm visit with ${apt.clientName} on ${apt.date} at ${apt.time}?`
        : `Confirmer la visite avec ${apt.clientName} le ${apt.date} à ${apt.time} ?`,
      [
        { text: isEnglish ? 'Cancel' : 'Annuler', style: 'cancel' },
        { 
          text: isEnglish ? 'Confirm' : 'Confirmer',
          onPress: async () => {
            if (!user) return;
            const result = await updateAppointmentStatus(apt.id, 'confirmed', user.id);
            if (result) {
              refresh();
            } else {
              Alert.alert(
                isEnglish ? 'Error' : 'Erreur',
                isEnglish ? 'Failed to confirm appointment' : 'Échec de la confirmation'
              );
            }
          },
        },
      ]
    );
  };

  const handleCancel = (apt: TransformedAppointment) => {
    Alert.alert(
      isEnglish ? 'Cancel Appointment' : 'Annuler le rendez-vous',
      isEnglish 
        ? 'Are you sure you want to cancel this appointment?'
        : 'Êtes-vous sûr de vouloir annuler ce rendez-vous ?',
      [
        { text: isEnglish ? 'No' : 'Non', style: 'cancel' },
        { 
          text: isEnglish ? 'Yes, Cancel' : 'Oui, Annuler',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            const result = await updateAppointmentStatus(apt.id, 'cancelled', user.id);
            if (result) {
              refresh();
            } else {
              Alert.alert(
                isEnglish ? 'Error' : 'Erreur',
                isEnglish ? 'Failed to cancel appointment' : 'Échec de l\'annulation'
              );
            }
          },
        },
      ]
    );
  };

  const handleComplete = async (apt: TransformedAppointment) => {
    if (!user) return;
    const result = await updateAppointmentStatus(apt.id, 'completed', user.id);
    if (result) {
      refresh();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'confirmed': return COLORS.primary;
      case 'completed': return COLORS.success;
      case 'cancelled': return COLORS.error;
      case 'no_show': return COLORS.warning;
      default: return COLORS.textLight;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: isEnglish ? 'Pending' : 'En attente',
      confirmed: isEnglish ? 'Confirmed' : 'Confirmé',
      completed: isEnglish ? 'Completed' : 'Terminé',
      cancelled: isEnglish ? 'Cancelled' : 'Annulé',
      no_show: isEnglish ? 'No Show' : 'Absent',
    };
    return labels[status] || status;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    };
    return date.toLocaleDateString(isEnglish ? 'en-US' : 'fr-FR', options);
  };

  const FilterChip: React.FC<{
    label: string;
    count: number;
    value: string;
  }> = ({ label, count, value }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        filterStatus === value && styles.filterChipActive,
      ]}
      onPress={() => setFilterStatus(value)}
    >
      <Text style={[
        styles.filterChipText,
        filterStatus === value && styles.filterChipTextActive,
      ]}>
        {label}
      </Text>
      <View style={[
        styles.filterChipBadge,
        filterStatus === value && styles.filterChipBadgeActive,
      ]}>
        <Text style={[
          styles.filterChipBadgeText,
          filterStatus === value && styles.filterChipBadgeTextActive,
        ]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const AppointmentCard: React.FC<{ appointment: TransformedAppointment }> = ({ appointment }) => (
    <View style={styles.appointmentCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.dateTimeContainer}>
          <Ionicons name="calendar" size={16} color={COLORS.primary} />
          <Text style={styles.dateText}>{formatDate(appointment.date)}</Text>
          <Ionicons name="time" size={16} color={COLORS.primary} style={{ marginLeft: 12 }} />
          <Text style={styles.timeText}>{appointment.time}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(appointment.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
            {getStatusLabel(appointment.status)}
          </Text>
        </View>
      </View>

      {/* Property */}
      <Text style={styles.propertyTitle} numberOfLines={1}>
        {appointment.propertyTitle}
      </Text>

      {/* Visit Type */}
      <View style={styles.visitTypeRow}>
        <Ionicons 
          name={appointment.visitType === 'in_person' ? 'walk' : 'videocam'} 
          size={16} 
          color={COLORS.textSecondary} 
        />
        <Text style={styles.visitTypeText}>
          {appointment.visitType === 'in_person' 
            ? (isEnglish ? 'In Person' : 'En personne')
            : (isEnglish ? 'Video Call' : 'Appel vidéo')}
        </Text>
        {appointment.visitType === 'video_call' && (
          <TouchableOpacity
            style={styles.videoCallButton}
            onPress={() => navigation.navigate('VideoCall', { appointmentId: appointment.id })}
          >
            <Ionicons name="videocam" size={16} color={COLORS.primary} />
            <Text style={styles.videoCallButtonText}>
              {isEnglish ? 'Join Call' : 'Rejoindre'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Client Info */}
      <View style={styles.clientSection}>
        <Text style={styles.clientLabel}>{isEnglish ? 'Client' : 'Client'}</Text>
        <Text style={styles.clientName}>{appointment.clientName}</Text>
        <View style={styles.clientContact}>
          <TouchableOpacity style={styles.contactItem}>
            <Ionicons name="call" size={14} color={COLORS.primary} />
            <Text style={styles.contactText}>{appointment.clientPhone}</Text>
          </TouchableOpacity>
          {appointment.clientEmail && (
            <TouchableOpacity style={styles.contactItem}>
              <Ionicons name="mail" size={14} color={COLORS.primary} />
              <Text style={styles.contactText}>{appointment.clientEmail}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Agent */}
      <View style={styles.agentRow}>
        <Ionicons name="person" size={14} color={COLORS.textLight} />
        <Text style={styles.agentText}>
          {isEnglish ? 'Agent: ' : 'Agent: '}{appointment.agentName}
        </Text>
      </View>

      {/* Message */}
      {appointment.message && (
        <View style={styles.messageBox}>
          <Ionicons name="chatbubble-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.messageText}>{appointment.message}</Text>
        </View>
      )}

      {/* Actions */}
      {appointment.status === 'pending' && (
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.confirmButton}
            onPress={() => handleConfirm(appointment)}
          >
            <Ionicons name="checkmark" size={18} color={COLORS.white} />
            <Text style={styles.confirmButtonText}>
              {isEnglish ? 'Confirm' : 'Confirmer'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancel(appointment)}
          >
            <Ionicons name="close" size={18} color={COLORS.error} />
            <Text style={styles.cancelButtonText}>
              {isEnglish ? 'Cancel' : 'Annuler'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {appointment.status === 'confirmed' && (
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={() => handleComplete(appointment)}
          >
            <Ionicons name="checkmark-done" size={18} color={COLORS.white} />
            <Text style={styles.completeButtonText}>
              {isEnglish ? 'Mark Complete' : 'Marquer terminé'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancel(appointment)}
          >
            <Ionicons name="close" size={18} color={COLORS.error} />
            <Text style={styles.cancelButtonText}>
              {isEnglish ? 'Cancel' : 'Annuler'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
          {isEnglish ? 'Appointments' : 'Rendez-vous'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <FilterChip label={isEnglish ? 'All' : 'Tous'} count={counts.all} value="all" />
        <FilterChip label={isEnglish ? 'Pending' : 'En attente'} count={counts.pending} value="pending" />
        <FilterChip label={isEnglish ? 'Confirmed' : 'Confirmé'} count={counts.confirmed} value="confirmed" />
        <FilterChip label={isEnglish ? 'Done' : 'Terminé'} count={counts.completed} value="completed" />
      </View>

      {/* List */}
      <FlatList
        data={getFilteredAppointments()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AppointmentCard appointment={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
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
              <Ionicons name="calendar-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyStateText}>
                {isEnglish ? 'No appointments' : 'Aucun rendez-vous'}
              </Text>
            </View>
          )
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.background,
    borderRadius: 16,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  filterChipBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  filterChipBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterChipBadgeText: {
    fontSize: 11,
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
  appointmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  visitTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  visitTypeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  videoCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius,
    marginLeft: 'auto',
  },
  videoCallButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  clientSection: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: 12,
    marginBottom: 8,
  },
  clientLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  clientContact: {
    gap: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 13,
    color: COLORS.primary,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  agentText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  messageBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: SIZES.radius,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 10,
    borderRadius: SIZES.radius,
    gap: 6,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 10,
    borderRadius: SIZES.radius,
    gap: 6,
  },
  cancelButtonText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: SIZES.radius,
    gap: 6,
  },
  completeButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
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

export default AdminAppointmentsScreen;

