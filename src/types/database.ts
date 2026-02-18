// Niumba - Supabase Database Types
// Auto-generated types for TypeScript

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'user' | 'agent' | 'owner' | 'editor' | 'admin';
export type PropertyType = 'house' | 'apartment' | 'flat' | 'dormitory' | 'townhouse' | 'land' | 'commercial' | 'warehouse';
export type PriceType = 'sale' | 'rent';
export type RentPeriod = 'day' | 'week' | 'month' | 'year';
export type PropertyStatus = 'draft' | 'pending' | 'active' | 'sold' | 'rented' | 'inactive';
export type InquiryStatus = 'new' | 'read' | 'responded' | 'closed';
export type CurrencyType = 'USD' | 'CDF';
export type AppointmentType = 'in_person' | 'video_call' | 'phone_call';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          company_name: string | null;
          company_logo: string | null;
          role: UserRole;
          language: 'fr' | 'en';
          city: string | null;
          province: string | null;
          is_verified: boolean;
          is_active: boolean;
          push_token: string | null;
          notification_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          company_name?: string | null;
          company_logo?: string | null;
          role?: UserRole;
          language?: 'fr' | 'en';
          city?: string | null;
          province?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          push_token?: string | null;
          notification_enabled?: boolean;
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          company_name?: string | null;
          company_logo?: string | null;
          role?: UserRole;
          language?: 'fr' | 'en';
          city?: string | null;
          province?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          push_token?: string | null;
          notification_enabled?: boolean;
        };
      };
      properties: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          title_en: string | null;
          description: string;
          description_en: string | null;
          type: PropertyType;
          status: PropertyStatus;
          price: number;
          currency: CurrencyType;
          price_type: PriceType;
          rent_period: RentPeriod | null;
          is_negotiable: boolean;
          address: string;
          city: string;
          province: string;
          neighborhood: string | null;
          latitude: number | null;
          longitude: number | null;
          bedrooms: number;
          bathrooms: number;
          area: number | null;
          land_area: number | null;
          garage: number;
          floors: number;
          year_built: number | null;
          features: string[];
          features_en: string[];
          amenities: string[];
          images: string[];
          video_url: string | null;
          virtual_tour_url: string | null;
          views: number;
          saves: number;
          inquiries_count: number;
          is_featured: boolean;
          is_verified: boolean;
          is_available: boolean;
          created_at: string;
          updated_at: string;
          published_at: string | null;
          expires_at: string | null;
          agent_id: string | null;
        };
        Insert: {
          id?: string;
          owner_id: string;
          agent_id?: string | null;
          title: string;
          title_en?: string | null;
          description: string;
          description_en?: string | null;
          type: PropertyType;
          status?: PropertyStatus;
          price: number;
          currency?: CurrencyType;
          price_type: PriceType;
          rent_period?: RentPeriod | null;
          is_negotiable?: boolean;
          address: string;
          city: string;
          province: string;
          neighborhood?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          bedrooms?: number;
          bathrooms?: number;
          area?: number | null;
          land_area?: number | null;
          garage?: number;
          floors?: number;
          year_built?: number | null;
          features?: string[];
          features_en?: string[];
          amenities?: string[];
          images?: string[];
          video_url?: string | null;
          virtual_tour_url?: string | null;
          is_featured?: boolean;
          is_verified?: boolean;
          is_available?: boolean;
        };
        Update: {
          agent_id?: string | null;
          title?: string;
          title_en?: string | null;
          description?: string;
          description_en?: string | null;
          type?: PropertyType;
          status?: PropertyStatus;
          price?: number;
          currency?: CurrencyType;
          price_type?: PriceType;
          rent_period?: RentPeriod | null;
          is_negotiable?: boolean;
          address?: string;
          city?: string;
          province?: string;
          neighborhood?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          bedrooms?: number;
          bathrooms?: number;
          area?: number | null;
          land_area?: number | null;
          garage?: number;
          floors?: number;
          year_built?: number | null;
          features?: string[];
          features_en?: string[];
          amenities?: string[];
          images?: string[];
          video_url?: string | null;
          virtual_tour_url?: string | null;
          is_featured?: boolean;
          is_verified?: boolean;
          is_available?: boolean;
          published_at?: string | null;
          expires_at?: string | null;
        };
      };
      saved_properties: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
        };
        Delete: {
          id?: string;
          user_id?: string;
          property_id?: string;
        };
      };
      inquiries: {
        Row: {
          id: string;
          property_id: string;
          sender_id: string | null;
          owner_id: string;
          sender_name: string;
          sender_email: string;
          sender_phone: string | null;
          subject: string | null;
          message: string;
          status: InquiryStatus;
          response: string | null;
          responded_at: string | null;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          property_id: string;
          sender_id?: string | null;
          owner_id: string;
          sender_name: string;
          sender_email: string;
          sender_phone?: string | null;
          subject?: string | null;
          message: string;
          status?: InquiryStatus;
        };
        Update: {
          status?: InquiryStatus;
          response?: string | null;
          responded_at?: string | null;
          read_at?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          title_en: string | null;
          body: string;
          body_en: string | null;
          type: string;
          data: Json;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          title_en?: string | null;
          body: string;
          body_en?: string | null;
          type: string;
          data?: Json;
          is_read?: boolean;
        };
        Update: {
          is_read?: boolean;
        };
      };
      cities: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          province: string;
          latitude: number | null;
          longitude: number | null;
          properties_count: number;
          is_active: boolean;
        };
      };
      appointments: {
        Row: {
          id: string;
          property_id: string;
          agent_id: string | null;
          client_id: string | null;
          client_name: string;
          client_email: string;
          client_phone: string | null;
          appointment_date: string;
          appointment_time: string;
          appointment_datetime: string;
          duration_minutes: number;
          appointment_type: AppointmentType;
          status: AppointmentStatus;
          notes: string | null;
          cancellation_reason: string | null;
          confirmed_at: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
          reminder_sent: boolean;
          reminder_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          agent_id?: string | null;
          client_id?: string | null;
          client_name: string;
          client_email: string;
          client_phone?: string | null;
          appointment_date: string;
          appointment_time: string;
          duration_minutes?: number;
          appointment_type?: AppointmentType;
          status?: AppointmentStatus;
          notes?: string | null;
        };
        Update: {
          agent_id?: string | null;
          appointment_date?: string;
          appointment_time?: string;
          duration_minutes?: number;
          appointment_type?: AppointmentType;
          status?: AppointmentStatus;
          notes?: string | null;
          cancellation_reason?: string | null;
          reminder_sent?: boolean;
        };
      };
      conversations: {
        Row: {
          id: string;
          participant_1: string;
          participant_2: string;
          property_id: string | null;
          last_message_at: string | null;
          last_message_preview: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          participant_1: string;
          participant_2: string;
          property_id?: string | null;
        };
        Update: {
          last_message_at?: string | null;
          last_message_preview?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          status: MessageStatus;
          attachment_url: string | null;
          attachment_type: string | null;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          status?: MessageStatus;
          attachment_url?: string | null;
          attachment_type?: string | null;
        };
        Update: {
          status?: MessageStatus;
          read_at?: string | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          property_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          helpful_count: number;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          user_id: string;
          rating: number;
          comment?: string | null;
        };
        Update: {
          rating?: number;
          comment?: string | null;
        };
      };
      agents: {
        Row: {
          id: string;
          user_id: string;
          license_number: string | null;
          bio: string | null;
          bio_en: string | null;
          specializations: string[];
          service_areas: string[];
          rating: number;
          review_count: number;
          properties_sold: number;
          properties_rented: number;
          is_verified: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          license_number?: string | null;
          bio?: string | null;
          bio_en?: string | null;
          specializations?: string[];
          service_areas?: string[];
        };
        Update: {
          license_number?: string | null;
          bio?: string | null;
          bio_en?: string | null;
          specializations?: string[];
          service_areas?: string[];
          is_verified?: boolean;
          is_active?: boolean;
        };
      };
      search_alerts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          filters: Json;
          is_active: boolean;
          match_count: number;
          last_triggered_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          filters: Json;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          filters?: Json;
          is_active?: boolean;
          match_count?: number;
          last_triggered_at?: string | null;
        };
      };
      price_history: {
        Row: {
          id: string;
          property_id: string;
          price: number;
          currency: CurrencyType;
          event_type: string;
          event_description: string | null;
          recorded_at: string;
        };
      };
    };
  };
}

// Utility types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Property = Database['public']['Tables']['properties']['Row'];
export type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
export type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

export type SavedProperty = Database['public']['Tables']['saved_properties']['Row'];
export type Inquiry = Database['public']['Tables']['inquiries']['Row'];
export type InquiryInsert = Database['public']['Tables']['inquiries']['Insert'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type City = Database['public']['Tables']['cities']['Row'];

// Appointments
export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
export type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

// Conversations & Messages
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];

// Reviews
export type Review = Database['public']['Tables']['reviews']['Row'];
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];

// Agents
export type Agent = Database['public']['Tables']['agents']['Row'];
export type AgentInsert = Database['public']['Tables']['agents']['Insert'];
export type AgentUpdate = Database['public']['Tables']['agents']['Update'];

// Search Alerts
export type SearchAlert = Database['public']['Tables']['search_alerts']['Row'];
export type SearchAlertInsert = Database['public']['Tables']['search_alerts']['Insert'];

// Price History
export type PriceHistory = Database['public']['Tables']['price_history']['Row'];

// Property with owner profile
export interface PropertyWithOwner extends Property {
  owner: Profile;
}

// Appointment with relations
export interface AppointmentWithDetails extends Appointment {
  property?: {
    id: string;
    title: string;
    title_en: string | null;
    images: string[];
    address: string;
  };
  agent?: Profile;
  client?: Profile;
}

// Conversation with last message and other participant
export interface ConversationWithDetails extends Conversation {
  other_participant: Profile;
  property?: {
    id: string;
    title: string;
    images: string[];
  };
  unread_count: number;
}

// Agent with profile
export interface AgentWithProfile extends Agent {
  profile: Profile;
}
