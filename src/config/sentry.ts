// Niumba - Sentry Configuration
// Error tracking and monitoring

// TODO: Install Sentry
// npm install @sentry/react-native
// npx @sentry/wizard@latest -i reactNative

/*
import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

export const initSentry = () => {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    enableInExpoDevelopment: false,
    debug: __DEV__,
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: __DEV__ ? 1.0 : 0.1, // 100% in dev, 10% in prod
    integrations: [
      new Sentry.ReactNativeTracing({
        routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),
      }),
    ],
  });
};

export const captureException = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

export const setUser = (userId: string, email?: string, username?: string) => {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
};

export const clearUser = () => {
  Sentry.setUser(null);
};

export default Sentry;
*/

// Placeholder until Sentry is installed
export const initSentry = () => {
  console.log('Sentry not configured. Install @sentry/react-native to enable error tracking.');
};

export const captureException = (error: Error, context?: Record<string, any>) => {
  console.error('Error (would be sent to Sentry):', error, context);
};

export const captureMessage = (message: string, level: string = 'info') => {
  console.log(`[${level.toUpperCase()}] ${message}`);
};

export const setUser = (userId: string, email?: string, username?: string) => {
  console.log('Sentry user set:', { userId, email, username });
};

export const clearUser = () => {
  console.log('Sentry user cleared');
};



