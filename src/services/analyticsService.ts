// Niumba - Analytics Service
// Système de tracking des événements pour comprendre l'utilisation
import { Platform } from 'react-native';

export type AnalyticsEvent = 
  | 'screen_view'
  | 'property_view'
  | 'property_save'
  | 'property_unsave'
  | 'search_performed'
  | 'filter_applied'
  | 'appointment_created'
  | 'appointment_cancelled'
  | 'message_sent'
  | 'video_call_started'
  | 'video_call_ended'
  | 'alert_created'
  | 'alert_deleted'
  | 'user_login'
  | 'user_signup'
  | 'user_logout'
  | 'contact_agent'
  | 'share_property'
  | 'error_occurred';

export interface AnalyticsProperties {
  [key: string]: string | number | boolean | null | undefined;
}

class AnalyticsService {
  private enabled: boolean = true;
  private events: Array<{ event: AnalyticsEvent; properties: AnalyticsProperties; timestamp: number }> = [];

  /**
   * Activer ou désactiver l'analytics
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Logger un événement
   */
  logEvent(event: AnalyticsEvent, properties?: AnalyticsProperties) {
    if (!this.enabled) return;

    const eventData = {
      event,
      properties: properties || {},
      timestamp: Date.now(),
      platform: Platform.OS,
    };

    // En développement, log dans la console
    if (__DEV__) {
      console.log('[Analytics]', event, properties);
    }

    // Stocker l'événement (pour envoi batch plus tard)
    this.events.push(eventData);

    // Limiter la taille du buffer (garder les 1000 derniers)
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    // TODO: En production, envoyer à un service d'analytics (Firebase, Mixpanel, etc.)
    // this.sendToAnalyticsService(eventData);
  }

  /**
   * Logger une vue d'écran
   */
  logScreenView(screenName: string, properties?: AnalyticsProperties) {
    this.logEvent('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Logger une erreur
   */
  logError(error: Error | string, properties?: AnalyticsProperties) {
    const errorMessage = error instanceof Error ? error.message : error;
    this.logEvent('error_occurred', {
      error_message: errorMessage,
      error_stack: error instanceof Error ? error.stack : undefined,
      ...properties,
    });
  }

  /**
   * Logger une recherche
   */
  logSearch(query: string, resultsCount: number, filters?: Record<string, any>) {
    this.logEvent('search_performed', {
      query,
      results_count: resultsCount,
      filters: filters ? JSON.stringify(filters) : undefined,
    });
  }

  /**
   * Logger une vue de propriété
   */
  logPropertyView(propertyId: string, propertyType?: string, price?: number) {
    this.logEvent('property_view', {
      property_id: propertyId,
      property_type: propertyType,
      price,
    });
  }

  /**
   * Logger la création d'un rendez-vous
   */
  logAppointmentCreated(appointmentId: string, appointmentType: string, propertyId: string) {
    this.logEvent('appointment_created', {
      appointment_id: appointmentId,
      appointment_type: appointmentType,
      property_id: propertyId,
    });
  }

  /**
   * Logger l'envoi d'un message
   */
  logMessageSent(conversationId: string, messageType: string = 'text') {
    this.logEvent('message_sent', {
      conversation_id: conversationId,
      message_type: messageType,
    });
  }

  /**
   * Logger le démarrage d'un appel vidéo
   */
  logVideoCallStarted(videoCallId: string, appointmentId: string) {
    this.logEvent('video_call_started', {
      video_call_id: videoCallId,
      appointment_id: appointmentId,
    });
  }

  /**
   * Récupérer les événements en attente
   */
  getPendingEvents() {
    return [...this.events];
  }

  /**
   * Vider les événements (après envoi)
   */
  clearEvents() {
    this.events = [];
  }

  /**
   * Envoyer les événements à un service externe
   * TODO: Implémenter l'intégration avec Firebase Analytics, Mixpanel, etc.
   */
  private async sendToAnalyticsService(eventData: any) {
    // Exemple d'intégration Firebase Analytics:
    // if (firebaseAnalytics) {
    //   firebaseAnalytics.logEvent(eventData.event, eventData.properties);
    // }

    // Exemple d'intégration Mixpanel:
    // if (mixpanel) {
    //   mixpanel.track(eventData.event, eventData.properties);
    // }
  }
}

// Instance singleton
export const analytics = new AnalyticsService();

export default analytics;
