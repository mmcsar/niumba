// Niumba - Configuration des intégrations externes
// Ajoutez vos clés API ici quand vous les aurez

export const INTEGRATIONS = {
  // ============================================
  // HUBSPOT CRM
  // ============================================
  // Pour obtenir les clés :
  // 1. Allez sur app.hubspot.com
  // 2. Settings → Integrations → API Key
  // 3. Ou créez une Private App
  hubspot: {
    enabled: false, // Passez à true quand configuré
    apiKey: '', // Votre API Key ou Access Token
    portalId: '', // Votre Portal ID (numéro dans l'URL)
  },

  // ============================================
  // GOOGLE MAPS (pour la carte)
  // ============================================
  googleMaps: {
    enabled: false,
    apiKey: '', // Google Cloud Console → APIs → Maps SDK
  },

  // ============================================
  // FIREBASE (notifications push alternatives)
  // ============================================
  firebase: {
    enabled: false,
    projectId: '',
    apiKey: '',
  },

  // ============================================
  // WHATSAPP BUSINESS (partage)
  // ============================================
  whatsapp: {
    enabled: true, // Fonctionne sans config (liens directs)
    businessNumber: '', // Optionnel: numéro WhatsApp Business
  },

  // ============================================
  // ANALYTICS
  // ============================================
  analytics: {
    // Mixpanel
    mixpanel: {
      enabled: false,
      token: '',
    },
    // Google Analytics
    googleAnalytics: {
      enabled: false,
      trackingId: '',
    },
  },
};

// Helper pour vérifier si une intégration est configurée
export const isIntegrationEnabled = (name: keyof typeof INTEGRATIONS): boolean => {
  const integration = INTEGRATIONS[name];
  return integration?.enabled === true;
};

export default INTEGRATIONS;

