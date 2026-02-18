// Niumba - Saved/Favorites Screen with Supabase
// COMPTE REQUIS - Les utilisateurs doivent être connectés
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import ZillowPropertyCard from '../components/ZillowPropertyCard';
import { useSavedProperties } from '../hooks/useSavedProperties';
import { useAuth } from '../context/AuthContext';

interface SavedScreenProps {
  navigation: any;
}

const SavedScreen: React.FC<SavedScreenProps> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const { 
    savedProperties, 
    savedCount, 
    isLoading, 
    refresh,
    toggleSave 
  } = useSavedProperties();
  
  const [refreshing, setRefreshing] = React.useState(false);
  const isEnglish = i18n.language === 'en';
  const isLoggedIn = !!user;

  const handlePropertyPress = (propertyId: string) => {
    navigation.navigate('PropertyDetail', { propertyId });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const renderProperty = ({ item }: { item: any }) => (
    <View style={styles.propertyItem}>
      <ZillowPropertyCard
        property={item}
        onPress={() => handlePropertyPress(item.id)}
        isEnglish={isEnglish}
        variant="horizontal"
      />
    </View>
  );

  // Si l'utilisateur n'est pas connecté, afficher l'écran de connexion
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isEnglish ? 'Saved Homes' : 'Biens Sauvegardés'}
          </Text>
        </View>

        {/* Login Required View */}
        <View style={styles.loginRequiredContainer}>
          <View style={styles.loginIconContainer}>
            <Ionicons name="heart" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.loginTitle}>
            {isEnglish ? 'Save your favorite homes' : 'Sauvegardez vos biens favoris'}
          </Text>
          <Text style={styles.loginSubtitle}>
            {isEnglish 
              ? 'Create a free account to save properties and access them from any device.' 
              : 'Créez un compte gratuit pour sauvegarder des propriétés et y accéder depuis n\'importe quel appareil.'}
          </Text>
          
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Ionicons name="log-in-outline" size={20} color={COLORS.white} />
            <Text style={styles.loginButtonText}>
              {isEnglish ? 'Sign In' : 'Se connecter'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>
              {isEnglish ? 'Create Account' : 'Créer un compte'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.exploreLink}
            onPress={() => navigation.navigate('Explore')}
          >
            <Text style={styles.exploreLinkText}>
              {isEnglish ? 'Continue browsing without account' : 'Continuer sans compte'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEnglish ? 'Saved Homes' : 'Biens Sauvegardés'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {savedCount} {isEnglish ? 'properties' : 'propriétés'}
        </Text>
      </View>

      {savedCount > 0 ? (
        <FlatList
          data={savedProperties}
          keyExtractor={(item) => item.id}
          renderItem={renderProperty}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="heart-outline" size={64} color={COLORS.textLight} />
          </View>
          <Text style={styles.emptyTitle}>
            {isEnglish ? 'No saved homes yet' : 'Aucun bien sauvegardé'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {isEnglish 
              ? 'Tap the heart icon on any home to save it here' 
              : 'Appuyez sur le cœur pour sauvegarder un bien'}
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Explore')}
          >
            <Text style={styles.exploreButtonText}>
              {isEnglish ? 'Explore homes' : 'Explorer les biens'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: 16,
    paddingBottom: 100,
  },
  propertyItem: {
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.white,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  exploreButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
  },
  exploreButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Styles pour l'écran "Connexion requise"
  loginRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding * 2,
  },
  loginIconContainer: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...SHADOWS.medium,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  loginSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    marginBottom: 12,
    width: '100%',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  registerButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    width: '100%',
    alignItems: 'center',
  },
  registerButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  exploreLink: {
    marginTop: 24,
    paddingVertical: 12,
  },
  exploreLinkText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default SavedScreen;
