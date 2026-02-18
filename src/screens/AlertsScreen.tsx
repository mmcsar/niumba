// Niumba - Custom Alerts Screen (Notifications for matching criteria)
// COMPTE REQUIS - Les utilisateurs doivent être connectés
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../hooks/useAlerts';
import { AlertCriteria } from '../services/alertService';
import LoginRequired from '../components/LoginRequired';
import { CITY_NAMES } from '../constants/cities';

const AlertsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const isEnglish = i18n.language === 'en';
  
  const {
    alerts,
    loading,
    error,
    loadAlerts,
    addAlert,
    updateAlertStatus,
    removeAlert,
    checkMatches,
  } = useAlerts();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlertName, setNewAlertName] = useState('');
  const [newAlertType, setNewAlertType] = useState<string | null>(null);
  const [newAlertCity, setNewAlertCity] = useState('');
  const [newAlertMinPrice, setNewAlertMinPrice] = useState('');
  const [newAlertMaxPrice, setNewAlertMaxPrice] = useState('');
  const [newAlertMinBedrooms, setNewAlertMinBedrooms] = useState('');
  const [newAlertTransactionType, setNewAlertTransactionType] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // COMPTE REQUIS: Vérification de l'authentification
  if (!user) {
    return (
      <LoginRequired 
        navigation={navigation}
        icon="notifications"
        title={{ 
          fr: 'Alertes personnalisées', 
          en: 'Custom Alerts' 
        }}
        subtitle={{ 
          fr: 'Connectez-vous pour créer des alertes et être notifié des nouvelles propriétés.', 
          en: 'Sign in to create alerts and get notified about new properties.' 
        }}
      />
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    // Check matches for all enabled alerts
    for (const alert of alerts.filter(a => a.enabled)) {
      await checkMatches(alert.id);
    }
    setRefreshing(false);
  };

  const toggleAlert = async (id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;

    const success = await updateAlertStatus(id, { enabled: !alert.enabled });
    if (success && !alert.enabled) {
      // If enabling, check for matches
      await checkMatches(id);
    }
  };

  const handleDeleteAlert = (id: string) => {
    Alert.alert(
      isEnglish ? 'Delete Alert' : 'Supprimer l\'alerte',
      isEnglish ? 'Are you sure you want to delete this alert?' : 'Êtes-vous sûr de vouloir supprimer cette alerte?',
      [
        { text: isEnglish ? 'Cancel' : 'Annuler', style: 'cancel' },
        { 
          text: isEnglish ? 'Delete' : 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            await removeAlert(id);
          }
        },
      ]
    );
  };

  const handleCreateAlert = async () => {
    if (!newAlertName.trim()) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Please enter an alert name' : 'Veuillez entrer un nom pour l\'alerte'
      );
      return;
    }

    const criteria: AlertCriteria = {
      property_type: newAlertType as any || undefined,
      transaction_type: newAlertTransactionType as any || undefined,
      city: newAlertCity || undefined,
      min_price: newAlertMinPrice ? parseFloat(newAlertMinPrice) : undefined,
      max_price: newAlertMaxPrice ? parseFloat(newAlertMaxPrice) : undefined,
      min_bedrooms: newAlertMinBedrooms ? parseInt(newAlertMinBedrooms) : undefined,
    };

    const newAlert = await addAlert(newAlertName.trim(), criteria);
    if (newAlert) {
      setShowCreateModal(false);
      resetForm();
      Alert.alert(
        isEnglish ? 'Success' : 'Succès',
        isEnglish ? 'Alert created successfully!' : 'Alerte créée avec succès!'
      );
    } else {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Failed to create alert' : 'Échec de la création de l\'alerte'
      );
    }
  };

  const resetForm = () => {
    setNewAlertName('');
    setNewAlertType(null);
    setNewAlertCity('');
    setNewAlertMinPrice('');
    setNewAlertMaxPrice('');
    setNewAlertMinBedrooms('');
    setNewAlertTransactionType(null);
  };

  const formatCriteria = (alert: typeof alerts[0]) => {
    const parts = [];
    if (alert.property_type) parts.push(alert.property_type);
    if (alert.city) parts.push(alert.city);
    if (alert.min_price || alert.max_price) {
      const priceRange = [];
      if (alert.min_price) priceRange.push(`${alert.min_price.toLocaleString()} XOF`);
      if (alert.max_price) priceRange.push(`${alert.max_price.toLocaleString()} XOF`);
      parts.push(priceRange.join(' - '));
    }
    if (alert.min_bedrooms) parts.push(`${alert.min_bedrooms}+ ${isEnglish ? 'beds' : 'ch.'}`);
    if (alert.transaction_type) parts.push(alert.transaction_type);
    return parts.join(' • ') || (isEnglish ? 'No criteria' : 'Aucun critère');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(isEnglish ? 'en-US' : 'fr-FR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const AlertCard: React.FC<{ alert: typeof alerts[0] }> = ({ alert }) => (
    <View style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <Text style={styles.alertName}>{alert.name}</Text>
          <Text style={styles.alertCriteria}>{formatCriteria(alert)}</Text>
        </View>
        <Switch
          value={alert.enabled}
          onValueChange={() => toggleAlert(alert.id)}
          trackColor={{ false: COLORS.borderLight, true: COLORS.primary + '50' }}
          thumbColor={alert.enabled ? COLORS.primary : COLORS.white}
        />
      </View>
      
      <View style={styles.alertStats}>
        <View style={styles.alertStat}>
          <Ionicons name="home-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.alertStatText}>
            {alert.match_count || 0} {isEnglish ? 'matches' : 'correspondances'}
          </Text>
        </View>
        {alert.last_notified && (
          <View style={styles.alertStat}>
            <Ionicons name="notifications-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.alertStatText}>
              {isEnglish ? 'Last:' : 'Dernier:'} {formatDate(alert.last_notified)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.alertActions}>
        <TouchableOpacity 
          style={styles.alertAction}
          onPress={async () => {
            // Check matches and show results
            const count = await checkMatches(alert.id);
            if (count > 0) {
              navigation.navigate('Explore', {
                filters: {
                  property_type: alert.property_type,
                  transaction_type: alert.transaction_type,
                  city: alert.city,
                  min_price: alert.min_price,
                  max_price: alert.max_price,
                  min_bedrooms: alert.min_bedrooms,
                }
              });
            } else {
              Alert.alert(
                isEnglish ? 'No matches' : 'Aucune correspondance',
                isEnglish ? 'No properties match your criteria yet.' : 'Aucune propriété ne correspond à vos critères pour le moment.'
              );
            }
          }}
        >
          <Ionicons name="eye-outline" size={18} color={COLORS.primary} />
          <Text style={styles.alertActionText}>
            {isEnglish ? 'View Matches' : 'Voir les résultats'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.alertAction}
          onPress={() => handleDeleteAlert(alert.id)}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          <Text style={[styles.alertActionText, { color: COLORS.error }]}>
            {isEnglish ? 'Delete' : 'Supprimer'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const TypeButton: React.FC<{ type: string; label: string }> = ({ type, label }) => (
    <TouchableOpacity
      style={[styles.typeButton, newAlertType === type && styles.typeButtonActive]}
      onPress={() => setNewAlertType(newAlertType === type ? null : type)}
    >
      <Text style={[styles.typeButtonText, newAlertType === type && styles.typeButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEnglish ? 'Property Alerts' : 'Alertes propriétés'}</Text>
        <View style={styles.placeholder} />
      </View>

      {loading && alerts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : !showCreateModal ? (
        <>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons name="notifications" size={24} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>
                  {isEnglish ? 'Get notified instantly' : 'Soyez notifié instantanément'}
                </Text>
                <Text style={styles.infoText}>
                  {isEnglish 
                    ? 'Create alerts to be notified when new properties match your criteria.'
                    : 'Créez des alertes pour être notifié quand de nouvelles propriétés correspondent à vos critères.'}
                </Text>
              </View>
            </View>

            {/* Alerts List */}
            <View style={styles.alertsList}>
              {alerts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="notifications-off-outline" size={48} color={COLORS.textLight} />
                  <Text style={styles.emptyTitle}>
                    {isEnglish ? 'No alerts yet' : 'Aucune alerte'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {isEnglish 
                      ? 'Create your first alert to get started'
                      : 'Créez votre première alerte pour commencer'}
                  </Text>
                </View>
              ) : (
                alerts.map(alert => <AlertCard key={alert.id} alert={alert} />)
              )}
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Create Button */}
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color={COLORS.white} />
            <Text style={styles.createButtonText}>
              {isEnglish ? 'Create Alert' : 'Créer une alerte'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        /* Create Alert Form */
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>
              {isEnglish ? 'New Alert' : 'Nouvelle alerte'}
            </Text>
            <TouchableOpacity onPress={() => { setShowCreateModal(false); resetForm(); }}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{isEnglish ? 'Alert Name' : 'Nom de l\'alerte'}</Text>
            <TextInput
              style={styles.input}
              value={newAlertName}
              onChangeText={setNewAlertName}
              placeholder={isEnglish ? 'e.g., My dream home' : 'ex: Ma maison de rêve'}
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{isEnglish ? 'Property Type' : 'Type de propriété'}</Text>
            <View style={styles.typeButtons}>
              <TypeButton type="house" label={isEnglish ? 'House' : 'Maison'} />
              <TypeButton type="apartment" label={isEnglish ? 'Apartment' : 'Appartement'} />
              <TypeButton type="land" label={isEnglish ? 'Land' : 'Terrain'} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{isEnglish ? 'City' : 'Ville'}</Text>
            <TextInput
              style={styles.input}
              value={newAlertCity}
              onChangeText={setNewAlertCity}
              placeholder={isEnglish ? 'e.g., Lubumbashi' : 'ex: Lubumbashi'}
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{isEnglish ? 'Price Range' : 'Fourchette de prix'}</Text>
            <View style={styles.priceInputs}>
              <TextInput
                style={[styles.input, styles.priceInput]}
                value={newAlertMinPrice}
                onChangeText={setNewAlertMinPrice}
                placeholder="Min $"
                placeholderTextColor={COLORS.textLight}
                keyboardType="numeric"
              />
              <Text style={styles.priceSeparator}>-</Text>
              <TextInput
                style={[styles.input, styles.priceInput]}
                value={newAlertMaxPrice}
                onChangeText={setNewAlertMaxPrice}
                placeholder="Max $"
                placeholderTextColor={COLORS.textLight}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{isEnglish ? 'Transaction Type' : 'Type de transaction'}</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[styles.typeButton, newAlertTransactionType === 'sale' && styles.typeButtonActive]}
                onPress={() => setNewAlertTransactionType(newAlertTransactionType === 'sale' ? null : 'sale')}
              >
                <Text style={[styles.typeButtonText, newAlertTransactionType === 'sale' && styles.typeButtonTextActive]}>
                  {isEnglish ? 'Sale' : 'Vente'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, newAlertTransactionType === 'rent' && styles.typeButtonActive]}
                onPress={() => setNewAlertTransactionType(newAlertTransactionType === 'rent' ? null : 'rent')}
              >
                <Text style={[styles.typeButtonText, newAlertTransactionType === 'rent' && styles.typeButtonTextActive]}>
                  {isEnglish ? 'Rent' : 'Location'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{isEnglish ? 'Minimum Bedrooms' : 'Chambres minimum'}</Text>
            <TextInput
              style={styles.input}
              value={newAlertMinBedrooms}
              onChangeText={setNewAlertMinBedrooms}
              placeholder={isEnglish ? 'e.g., 3' : 'ex: 3'}
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleCreateAlert}>
            <Text style={styles.submitButtonText}>
              {isEnglish ? 'Create Alert' : 'Créer l\'alerte'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
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
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  infoCard: {
    flexDirection: 'row',
    margin: SIZES.screenPadding,
    padding: 16,
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  alertsList: {
    paddingHorizontal: SIZES.screenPadding,
  },
  alertCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.card,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  alertInfo: {
    flex: 1,
    marginRight: 12,
  },
  alertName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  alertCriteria: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  alertStats: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  alertStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertStatText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  alertActions: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 24,
  },
  alertAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertActionText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  createButton: {
    position: 'absolute',
    bottom: 24,
    left: SIZES.screenPadding,
    right: SIZES.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    gap: 8,
    ...SHADOWS.medium,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  formContainer: {
    flex: 1,
    padding: SIZES.screenPadding,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    ...SHADOWS.small,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  typeButtonTextActive: {
    color: COLORS.white,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceInput: {
    flex: 1,
  },
  priceSeparator: {
    fontSize: 18,
    color: COLORS.textLight,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default AlertsScreen;

