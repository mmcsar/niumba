// Niumba - Auth Guard Utility
// Vérifie si l'utilisateur est connecté avant certaines actions

import { Alert } from 'react-native';
import i18n from '../i18n';

export interface AuthGuardOptions {
  navigation: any;
  user: any | null;
  action: 'save' | 'contact' | 'appointment' | 'review' | 'message' | 'alert' | 'publish';
  onSuccess?: () => void;
}

const getActionMessage = (action: string, isEnglish: boolean): { title: string; message: string } => {
  const messages: Record<string, { fr: { title: string; message: string }; en: { title: string; message: string } }> = {
    save: {
      fr: {
        title: 'Connexion requise',
        message: 'Créez un compte gratuit pour sauvegarder vos propriétés favorites.',
      },
      en: {
        title: 'Login Required',
        message: 'Create a free account to save your favorite properties.',
      },
    },
    contact: {
      fr: {
        title: 'Connexion requise',
        message: 'Connectez-vous pour contacter le propriétaire.',
      },
      en: {
        title: 'Login Required',
        message: 'Sign in to contact the property owner.',
      },
    },
    appointment: {
      fr: {
        title: 'Connexion requise',
        message: 'Connectez-vous pour prendre rendez-vous.',
      },
      en: {
        title: 'Login Required',
        message: 'Sign in to book an appointment.',
      },
    },
    review: {
      fr: {
        title: 'Connexion requise',
        message: 'Connectez-vous pour laisser un avis.',
      },
      en: {
        title: 'Login Required',
        message: 'Sign in to leave a review.',
      },
    },
    message: {
      fr: {
        title: 'Connexion requise',
        message: 'Connectez-vous pour envoyer un message.',
      },
      en: {
        title: 'Login Required',
        message: 'Sign in to send a message.',
      },
    },
    alert: {
      fr: {
        title: 'Connexion requise',
        message: 'Connectez-vous pour créer des alertes personnalisées.',
      },
      en: {
        title: 'Login Required',
        message: 'Sign in to create personalized alerts.',
      },
    },
    publish: {
      fr: {
        title: 'Connexion requise',
        message: 'Connectez-vous pour publier une propriété.',
      },
      en: {
        title: 'Login Required',
        message: 'Sign in to publish a property.',
      },
    },
  };

  const lang = isEnglish ? 'en' : 'fr';
  return messages[action]?.[lang] || messages.save[lang];
};

/**
 * Vérifie si l'utilisateur est connecté avant d'effectuer une action
 * Si non connecté, affiche une alerte et redirige vers la page de connexion
 */
export const requireAuth = ({ navigation, user, action, onSuccess }: AuthGuardOptions): boolean => {
  const isEnglish = i18n.language === 'en';
  
  if (user) {
    // L'utilisateur est connecté, exécuter l'action
    onSuccess?.();
    return true;
  }

  // L'utilisateur n'est pas connecté, afficher l'alerte
  const { title, message } = getActionMessage(action, isEnglish);
  
  Alert.alert(
    title,
    message,
    [
      {
        text: isEnglish ? 'Cancel' : 'Annuler',
        style: 'cancel',
      },
      {
        text: isEnglish ? 'Sign In' : 'Se connecter',
        onPress: () => navigation.navigate('Login'),
      },
      {
        text: isEnglish ? 'Create Account' : 'Créer un compte',
        onPress: () => navigation.navigate('Register'),
      },
    ]
  );

  return false;
};

/**
 * Hook helper pour utiliser dans les composants
 */
export const createAuthGuard = (navigation: any, user: any | null) => {
  return (action: AuthGuardOptions['action'], onSuccess?: () => void) => {
    return requireAuth({ navigation, user, action, onSuccess });
  };
};

/**
 * Vérifie simplement si l'utilisateur est connecté
 */
export const isAuthenticated = (user: any | null): boolean => {
  return user !== null && user !== undefined;
};

/**
 * Messages d'erreur pour les opérations RLS
 */
export const getRLSErrorMessage = (error: any, isEnglish: boolean): string => {
  const errorCode = error?.code || '';
  const errorMessage = error?.message || '';

  // Erreur de permission RLS
  if (errorCode === '42501' || errorMessage.includes('permission denied') || errorMessage.includes('row-level security')) {
    return isEnglish
      ? 'You must be signed in to perform this action.'
      : 'Vous devez être connecté pour effectuer cette action.';
  }

  // Erreur de violation de politique
  if (errorMessage.includes('violates row-level security policy')) {
    return isEnglish
      ? 'You do not have permission to access this resource.'
      : 'Vous n\'avez pas la permission d\'accéder à cette ressource.';
  }

  // Erreur générique
  return isEnglish
    ? 'An error occurred. Please try again.'
    : 'Une erreur s\'est produite. Veuillez réessayer.';
};

export default requireAuth;

