// Niumba - Book Appointment Screen
// COMPTE REQUIS - Les utilisateurs doivent être connectés
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { getPropertyById } from '../constants/data';
import { useAuth } from '../context/AuthContext';
import { useCreateAppointment } from '../hooks/useAppointments';
import LoginRequired from '../components/LoginRequired';
import { validate, ValidationRules, validateAndSanitizeEmail, validateAndSanitizePhone, validateAppointmentDate } from '../utils/validation';
import { analytics } from '../services/analyticsService';

interface BookAppointmentScreenProps {
  navigation: any;
  route: {
    params: {
      propertyId: string;
      propertyTitle: string;
      ownerName: string;
      ownerId: string;
    };
  };
}

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00',
  '14:00', '15:00', '16:00', '17:00'
];

const BookAppointmentScreen: React.FC<BookAppointmentScreenProps> = ({ navigation, route }) => {
  const { propertyId, propertyTitle, ownerName, ownerId } = route.params;
  const { i18n } = useTranslation();
  const { user, profile } = useAuth();
  const isEnglish = i18n.language === 'en';
  
  // Hook Supabase
  const { create: createAppointment, loading: isSubmitting, error: appointmentError } = useCreateAppointment();

  // Generate next 14 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Tous les hooks doivent être appelés AVANT tout return conditionnel
  const [availableDates] = useState(generateDates());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [visitType, setVisitType] = useState<'in_person' | 'virtual'>('in_person');
  const [name, setName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');

  const property = getPropertyById(propertyId);
  
  // COMPTE REQUIS: Vérification de l'authentification (APRÈS tous les hooks)
  if (!user) {
    return (
      <LoginRequired 
        navigation={navigation}
        icon="calendar"
        title={{ 
          fr: 'Prendre rendez-vous', 
          en: 'Book Appointment' 
        }}
        subtitle={{ 
          fr: 'Connectez-vous pour planifier une visite de cette propriété.', 
          en: 'Sign in to schedule a visit for this property.' 
        }}
      />
    );
  }

  const formatDate = (date: Date) => {
    const days = isEnglish 
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = isEnglish
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
    };
  };

  const handleSubmit = async () => {
    // Vérifier que l'utilisateur est connecté
    if (!user) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish 
          ? 'You must be logged in to book an appointment' 
          : 'Vous devez être connecté pour prendre un rendez-vous'
      );
      return;
    }

    // Validation de la date
    if (!selectedDate) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish 
          ? 'Please select a date' 
          : 'Veuillez sélectionner une date'
      );
      return;
    }

    const dateValidation = validateAppointmentDate(selectedDate);
    if (!dateValidation.isValid) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        dateValidation.errors[0]
      );
      return;
    }

    // Validation de l'heure
    if (!selectedTime) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish 
          ? 'Please select a time' 
          : 'Veuillez sélectionner une heure'
      );
      return;
    }

    // Validation du nom
    const nameValidation = validate(name, [ValidationRules.required, ValidationRules.minLength(2)]);
    if (!nameValidation.isValid) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        nameValidation.errors[0]
      );
      return;
    }

    // Validation et sanitization de l'email
    let sanitizedEmail = email;
    if (email) {
      const emailValidation = validateAndSanitizeEmail(email);
      if (!emailValidation.isValid) {
        Alert.alert(
          isEnglish ? 'Error' : 'Erreur',
          isEnglish ? 'Invalid email address' : 'Adresse email invalide'
        );
        return;
      }
      // Utiliser l'email sanitized
      sanitizedEmail = emailValidation.email;
    }

    // Validation et sanitization du téléphone
    const phoneValidation = validateAndSanitizePhone(phone);
    if (!phoneValidation.isValid) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Invalid phone number' : 'Numéro de téléphone invalide'
      );
      return;
    }

    try {
      // Format date and time for Supabase
      const appointmentDate = selectedDate.toISOString().split('T')[0];
      const appointmentType = visitType === 'in_person' ? 'in_person' : 'video_call';

      console.log('Creating appointment with data:', {
        property_id: propertyId,
        appointment_date: appointmentDate,
        appointment_time: selectedTime,
        appointment_type: appointmentType,
        agent_id: ownerId,
      });

      const appointment = await createAppointment({
        property_id: propertyId,
        appointment_date: appointmentDate,
        appointment_time: selectedTime,
        appointment_type: appointmentType,
        agent_id: ownerId,
        client_notes: message.trim() || undefined,
      });

      if (appointment) {
        // Logger l'événement analytics
        analytics.logAppointmentCreated(appointment.id, appointmentType, propertyId);

        Alert.alert(
          isEnglish ? 'Appointment Requested!' : 'Rendez-vous demandé !',
          isEnglish 
            ? `Your visit request for ${formatDate(selectedDate).month} ${formatDate(selectedDate).date} at ${selectedTime} has been sent to ${ownerName}. They will contact you to confirm.`
            : `Votre demande de visite pour le ${formatDate(selectedDate).date} ${formatDate(selectedDate).month} à ${selectedTime} a été envoyée à ${ownerName}. Il vous contactera pour confirmer.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        // Afficher l'erreur du hook ou un message par défaut
        const errorMessage = appointmentError || (isEnglish 
          ? 'Failed to create appointment. Please try again.' 
          : 'Échec de la création du rendez-vous. Veuillez réessayer.');
        
        console.error('Failed to create appointment:', appointmentError);
        Alert.alert(
          isEnglish ? 'Error' : 'Erreur',
          errorMessage
        );
      }
    } catch (error) {
      // Logger l'erreur dans analytics
      analytics.logError(error instanceof Error ? error : new Error(String(error)), {
        screen: 'BookAppointmentScreen',
        action: 'create_appointment',
      });

      console.error('Error in handleSubmit:', error);
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish 
          ? 'An error occurred while creating the appointment. Please try again.' 
          : 'Une erreur s\'est produite lors de la création du rendez-vous. Veuillez réessayer.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEnglish ? 'Book a Visit' : 'Prendre Rendez-vous'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Property Preview */}
        {property && (
          <View style={styles.propertyPreview}>
            <Image 
              source={{ uri: property.images[0] }} 
              style={styles.propertyImage}
            />
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyTitle} numberOfLines={2}>
                {isEnglish ? property.titleEn : property.title}
              </Text>
              <Text style={styles.propertyAddress}>
                {property.address}, {property.city}
              </Text>
              <Text style={styles.propertyPrice}>
                ${property.price.toLocaleString()}
                {property.priceType === 'rent' && (isEnglish ? '/mo' : '/mois')}
              </Text>
            </View>
          </View>
        )}

        {/* Visit Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'Visit Type' : 'Type de visite'}
          </Text>
          <View style={styles.visitTypeContainer}>
            <TouchableOpacity
              style={[
                styles.visitTypeButton,
                visitType === 'in_person' && styles.visitTypeButtonActive,
              ]}
              onPress={() => setVisitType('in_person')}
            >
              <Ionicons 
                name="walk" 
                size={24} 
                color={visitType === 'in_person' ? COLORS.white : COLORS.textSecondary} 
              />
              <Text style={[
                styles.visitTypeText,
                visitType === 'in_person' && styles.visitTypeTextActive,
              ]}>
                {isEnglish ? 'In Person' : 'En personne'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.visitTypeButton,
                visitType === 'virtual' && styles.visitTypeButtonActive,
              ]}
              onPress={() => setVisitType('virtual')}
            >
              <Ionicons 
                name="videocam" 
                size={24} 
                color={visitType === 'virtual' ? COLORS.white : COLORS.textSecondary} 
              />
              <Text style={[
                styles.visitTypeText,
                visitType === 'virtual' && styles.visitTypeTextActive,
              ]}>
                {isEnglish ? 'Video Call' : 'Appel vidéo'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'Select Date' : 'Choisir une date'}
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datesContainer}
          >
            {availableDates.map((date, index) => {
              const formatted = formatDate(date);
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateCard,
                    isSelected && styles.dateCardActive,
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text style={[
                    styles.dateDay,
                    isSelected && styles.dateDayActive,
                  ]}>
                    {formatted.day}
                  </Text>
                  <Text style={[
                    styles.dateNumber,
                    isSelected && styles.dateNumberActive,
                  ]}>
                    {formatted.date}
                  </Text>
                  <Text style={[
                    styles.dateMonth,
                    isSelected && styles.dateMonthActive,
                  ]}>
                    {formatted.month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'Select Time' : 'Choisir une heure'}
          </Text>
          <View style={styles.timeSlotsContainer}>
            {TIME_SLOTS.map((time, index) => {
              const isSelected = selectedTime === time;
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlot,
                    isSelected && styles.timeSlotActive,
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Ionicons 
                    name="time-outline" 
                    size={16} 
                    color={isSelected ? COLORS.white : COLORS.textSecondary} 
                  />
                  <Text style={[
                    styles.timeSlotText,
                    isSelected && styles.timeSlotTextActive,
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish ? 'Your Information' : 'Vos informations'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {isEnglish ? 'Full Name *' : 'Nom complet *'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={isEnglish ? 'Enter your name' : 'Entrez votre nom'}
              placeholderTextColor={COLORS.textLight}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {isEnglish ? 'Phone Number *' : 'Numéro de téléphone *'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="+243 XX XXX XXXX"
              placeholderTextColor={COLORS.textLight}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {isEnglish ? 'Email (optional)' : 'Email (optionnel)'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={isEnglish ? 'your@email.com' : 'votre@email.com'}
              placeholderTextColor={COLORS.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {isEnglish ? 'Message (optional)' : 'Message (optionnel)'}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={isEnglish 
                ? 'Any specific questions or requests...' 
                : 'Questions ou demandes spécifiques...'}
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
            />
          </View>
        </View>

        {/* Summary */}
        {selectedDate && selectedTime && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
              <Text style={styles.summaryTitle}>
                {isEnglish ? 'Appointment Summary' : 'Résumé du rendez-vous'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{isEnglish ? 'Date:' : 'Date:'}</Text>
              <Text style={styles.summaryValue}>
                {formatDate(selectedDate).day}, {formatDate(selectedDate).date} {formatDate(selectedDate).month}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{isEnglish ? 'Time:' : 'Heure:'}</Text>
              <Text style={styles.summaryValue}>{selectedTime}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{isEnglish ? 'Type:' : 'Type:'}</Text>
              <Text style={styles.summaryValue}>
                {visitType === 'in_person' 
                  ? (isEnglish ? 'In Person' : 'En personne')
                  : (isEnglish ? 'Video Call' : 'Appel vidéo')}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{isEnglish ? 'Agent:' : 'Agent:'}</Text>
              <Text style={styles.summaryValue}>{ownerName}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedDate || !selectedTime || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedDate || !selectedTime || isSubmitting}
        >
          {isSubmitting ? (
            <Text style={styles.submitButtonText}>
              {isEnglish ? 'Sending...' : 'Envoi...'}
            </Text>
          ) : (
            <>
              <Ionicons name="calendar-outline" size={20} color={COLORS.white} />
              <Text style={styles.submitButtonText}>
                {isEnglish ? 'Request Appointment' : 'Demander un rendez-vous'}
              </Text>
            </>
          )}
        </TouchableOpacity>
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
  propertyPreview: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    margin: SIZES.screenPadding,
    borderRadius: SIZES.radiusLarge,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  propertyImage: {
    width: 100,
    height: 100,
  },
  propertyInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  propertyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  propertyAddress: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.screenPadding,
    marginBottom: 16,
    borderRadius: SIZES.radiusLarge,
    padding: 16,
    ...SHADOWS.card,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  visitTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  visitTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    gap: 8,
  },
  visitTypeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  visitTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  visitTypeTextActive: {
    color: COLORS.white,
  },
  datesContainer: {
    paddingVertical: 4,
    gap: 10,
  },
  dateCard: {
    width: 70,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginRight: 10,
  },
  dateCardActive: {
    backgroundColor: COLORS.primary,
  },
  dateDay: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  dateDayActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  dateNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginVertical: 4,
  },
  dateNumberActive: {
    color: COLORS.white,
  },
  dateMonth: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dateMonthActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    gap: 6,
  },
  timeSlotActive: {
    backgroundColor: COLORS.primary,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  timeSlotTextActive: {
    color: COLORS.white,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  summaryCard: {
    backgroundColor: COLORS.primaryLight,
    marginHorizontal: SIZES.screenPadding,
    marginBottom: 16,
    borderRadius: SIZES.radiusLarge,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 106, 255, 0.2)',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 12,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...SHADOWS.large,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default BookAppointmentScreen;

