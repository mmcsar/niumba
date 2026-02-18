// Niumba - Type Definitions

// Re-export database types
export * from './database';

export interface Property {
  id: string;
  title: string;
  titleEn: string;
  type: PropertyType;
  price: number;
  currency: 'USD' | 'CDF';
  priceType: 'sale' | 'rent';
  rentPeriod?: 'month' | 'year';
  address: string;
  city: string;
  province: 'Haut-Katanga' | 'Lualaba';
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  area: number; // in square meters
  garage: number;
  description: string;
  descriptionEn: string;
  images: string[];
  features: string[];
  featuresEn: string[];
  owner: Owner;
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
  isAvailable: boolean;
  views: number;
  // Virtual Tour
  virtualTourUrl?: string;
  virtualTourRooms?: VirtualTourRoom[];
}

export interface VirtualTourRoom {
  id: string;
  name: string;
  imageUrl: string;
  hotspots?: VirtualTourHotspot[];
}

export interface VirtualTourHotspot {
  x: number;
  y: number;
  targetRoomId: string;
  label: string;
}

export type PropertyType = 
  | 'house'
  | 'apartment'
  | 'flat'
  | 'dormitory'
  | 'townhouse'
  | 'land'
  | 'commercial'
  | 'warehouse';

export interface Owner {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email: string;
  avatar?: string;
  isVerified: boolean;
  propertiesCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  company?: string;
  role: 'buyer' | 'seller' | 'agent' | 'admin';
  savedProperties: string[];
  language: 'fr' | 'en';
  location?: {
    city: string;
    province: string;
  };
  createdAt: string;
}

export interface Category {
  id: PropertyType;
  name: string;
  nameEn: string;
  icon: string;
}

export interface SearchFilters {
  type?: PropertyType;
  priceMin?: number;
  priceMax?: number;
  priceType?: 'sale' | 'rent';
  bedrooms?: number;
  bathrooms?: number;
  areaMin?: number;
  areaMax?: number;
  city?: string;
  province?: 'Haut-Katanga' | 'Lualaba';
}

export interface Location {
  id: string;
  name: string;
  nameEn: string;
}

// Navigation types
export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  PropertyDetail: { propertyId: string };
  Search: { filters?: SearchFilters };
  OwnerProfile: { ownerId: string };
  Settings: undefined;
  Language: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Map: { initialRegion?: { latitude: number; longitude: number } };
  ContactForm: { propertyId: string; propertyTitle: string; ownerId: string; ownerName: string };
  AdvancedSearch: { initialFilters?: SearchFilters };
  // New Features
  MortgageCalculator: { propertyPrice?: number };
  CompareProperties: { propertyIds?: string[] };
  Chat: { recipientId: string; recipientName: string; recipientAvatar?: string; propertyId?: string; propertyTitle?: string };
  Conversations: undefined;
  NearbySearch: undefined;
  Reviews: { propertyId: string; propertyTitle: string };
  PriceHistory: { propertyId: string; propertyTitle: string; currentPrice: number };
  Alerts: undefined;
  VirtualTour: { propertyId: string; propertyTitle: string; tourRooms?: VirtualTourRoom[] };
  BookAppointment: { propertyId: string; propertyTitle: string; ownerName: string; ownerId: string };
  Notifications: undefined;
  NotificationSettings: undefined;
  // Admin
  AdminDashboard: undefined;
  AdminProperties: { filter?: string };
  AdminAddProperty: undefined;
  AdminEditProperty: { propertyId: string };
  AdminUsers: undefined;
  AdminInquiries: undefined;
  AdminAnalytics: undefined;
  AdminSettings: undefined;
  AdminNotifications: undefined;
  AdminNotificationSettings: undefined;
  AdminAgents: undefined;
  AdminAppointments: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Saved: undefined;
  Profile: undefined;
};

// Appointment types for UI
export interface AppointmentUI {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage?: string;
  agentId?: string;
  agentName?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: 'in_person' | 'video_call' | 'phone_call';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt: string;
}

