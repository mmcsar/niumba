// Niumba - Error Boundary Component
// Capture les erreurs React et affiche un écran d'erreur élégant
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, SIZES } from '../constants/theme';
import { analytics } from '../services/analyticsService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Logger l'erreur
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Envoyer à l'analytics
    analytics.logError(error, {
      component_stack: errorInfo.componentStack,
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="alert-circle" size={64} color={COLORS.error} />
        </View>

        <Text style={styles.title}>
          {isEnglish ? 'Oops! Something went wrong' : 'Oups ! Une erreur est survenue'}
        </Text>

        <Text style={styles.message}>
          {isEnglish
            ? "We're sorry, but something unexpected happened. Please try again."
            : "Nous sommes désolés, mais une erreur inattendue s'est produite. Veuillez réessayer."}
        </Text>

        {__DEV__ && error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>
              {isEnglish ? 'Error Details:' : 'Détails de l\'erreur :'}
            </Text>
            <Text style={styles.errorText}>{error.message}</Text>
            {error.stack && (
              <Text style={styles.errorStack}>{error.stack}</Text>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={onReset}>
          <Text style={styles.buttonText}>
            {isEnglish ? 'Try Again' : 'Réessayer'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  iconContainer: {
    marginBottom: SIZES.marginLarge,
  },
  title: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.margin,
  },
  message: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.marginLarge,
    lineHeight: 22,
  },
  errorContainer: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.marginLarge,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorTitle: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: SIZES.paddingSmall,
  },
  errorText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    marginBottom: SIZES.paddingSmall,
  },
  errorStack: {
    fontSize: SIZES.xs,
    color: COLORS.textLight,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.paddingXL,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    minWidth: 200,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ErrorBoundary;


