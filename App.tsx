// Niumba - Real Estate B2B App
// Haut-Katanga & Lualaba, RDC
import React from 'react';
import { StatusBar, LogBox, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Ignore specific warnings and errors (expected in Expo Go)
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'expo-notifications',
  '`expo-notifications` functionality is not fully supported',
  'Android Push notifications',
  'expo-notifications: Android Push notifications',
  'was removed from Expo Go',
  'Use a development build instead',
]);

// Also ignore errors from expo-notifications in Expo Go
if (__DEV__) {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    if (
      message.includes('expo-notifications') &&
      (message.includes('removed from Expo Go') ||
       message.includes('development build') ||
       message.includes('SDK 53'))
    ) {
      // Silently ignore expo-notifications errors in Expo Go
      return;
    }
    originalError.apply(console, args);
  };
}

// i18n initialization (must be imported before navigation)
import './src/i18n';

// Providers
import { AuthProvider } from './src/context/AuthContext';
import { OfflineProvider, useOffline } from './src/context/OfflineContext';
import { ThemeProvider } from './src/context/ThemeContext';

// Components
import OfflineBanner from './src/components/OfflineBanner';
import ErrorBoundary from './src/components/ErrorBoundary';
import OfflineIndicator from './src/components/OfflineIndicator';

// Navigation
import Navigation from './src/navigation';
import { COLORS } from './src/constants/theme';

// Main App Content with Offline Banner
const AppContent: React.FC = () => {
  const { isOfflineMode, lastSyncTime, refreshConnection } = useOffline();

  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner 
        isOffline={isOfflineMode} 
        lastSyncTime={lastSyncTime}
        onRetry={refreshConnection}
      />
      <OfflineIndicator />
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />
      <Navigation />
    </View>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <OfflineProvider>
                <AppContent />
              </OfflineProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
