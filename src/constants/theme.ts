// Niumba - Theme Constants (Zillow-inspired)
// Real Estate B2B App for Haut-Katanga & Lualaba

export const COLORS = {
  // Primary - Zillow Blue
  primary: '#006AFF',
  primaryDark: '#0051CC',
  primaryLight: '#E8F4FF',
  
  // Secondary - Deep Blue for text
  secondary: '#2A2A33',
  secondaryLight: '#3D3D47',
  
  // Accent - Green for prices/available
  accent: '#00A86B',
  accentLight: '#E6F7F0',
  
  // Red for alerts/heart
  heart: '#E4002B',
  heartLight: '#FFE8EC',
  
  // Neutrals
  white: '#FFFFFF',
  background: '#F7F7F7',
  card: '#FFFFFF',
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  
  // Text
  textPrimary: '#2A2A33',
  textSecondary: '#6B6B76',
  textLight: '#9B9BA5',
  textWhite: '#FFFFFF',
  
  // Status
  success: '#00A86B',
  warning: '#FFB800',
  error: '#E4002B',
  info: '#006AFF',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Map
  mapMarker: '#006AFF',
  mapCluster: '#E4002B',

  // Error light (alias)
  errorLight: '#FFE8EC',

  // Shadows
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
  },
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};

export const SIZES = {
  // Base
  base: 8,
  xs: 10,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  title: 28,
  
  // Radius
  radiusXs: 4,
  radiusSmall: 8,
  radius: 12,
  radiusLarge: 16,
  radiusXL: 20,
  radiusFull: 100,
  
  // Spacing
  padding: 16,
  paddingSmall: 12,
  paddingLarge: 20,
  paddingXL: 24,
  margin: 16,
  marginLarge: 24,
  
  // Screen
  screenPadding: 16,
  
  // Components
  buttonHeight: 52,
  inputHeight: 48,
  cardImageHeight: 200,
  avatarSmall: 32,
  avatarMedium: 44,
  avatarLarge: 64,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
};

// Locations in Haut-Katanga & Lualaba
export const LOCATIONS = {
  hautKatanga: [
    { id: 'lshi', name: 'Lubumbashi', nameEn: 'Lubumbashi', lat: -11.6876, lng: 27.4847 },
    { id: 'likasi', name: 'Likasi', nameEn: 'Likasi', lat: -10.9833, lng: 26.7333 },
    { id: 'kipushi', name: 'Kipushi', nameEn: 'Kipushi', lat: -11.7667, lng: 27.2333 },
    { id: 'kasumbalesa', name: 'Kasumbalesa', nameEn: 'Kasumbalesa', lat: -12.2333, lng: 27.8000 },
    { id: 'kambove', name: 'Kambove', nameEn: 'Kambove', lat: -10.8667, lng: 26.6000 },
  ],
  lualaba: [
    { id: 'kolwezi', name: 'Kolwezi', nameEn: 'Kolwezi', lat: -10.7167, lng: 25.4667 },
    { id: 'fungurume', name: 'Fungurume', nameEn: 'Fungurume', lat: -10.6167, lng: 26.3000 },
    { id: 'dilolo', name: 'Dilolo', nameEn: 'Dilolo', lat: -10.6833, lng: 22.3500 },
    { id: 'mutshatsha', name: 'Mutshatsha', nameEn: 'Mutshatsha', lat: -10.0000, lng: 25.0000 },
  ],
};

export default { COLORS, FONTS, SIZES, SHADOWS, LOCATIONS };
