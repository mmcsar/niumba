// Niumba - User Service
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { maskAdminRole, getPublicProfile } from '../utils/securityUtils';
import { errorLog } from '../utils/logHelper';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'user' | 'agent' | 'admin';
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  metadata?: Record<string, any>;
}

/**
 * Get all users with optional filters
 * NOTE: Le rôle admin est masqué pour les utilisateurs non-admins
 */
export const getUsers = async (options: {
  page?: number;
  pageSize?: number;
  role?: 'user' | 'agent' | 'admin';
  isActive?: boolean;
  search?: string;
  currentUserId?: string | null;
  isCurrentUserAdmin?: boolean;
} = {}): Promise<{ data: User[]; count: number }> => {
  const { 
    page = 0, 
    pageSize = 20, 
    role, 
    isActive, 
    search,
    currentUserId = null,
    isCurrentUserAdmin = false,
  } = options;

  if (!isSupabaseConfigured()) {
    return { data: [], count: 0 };
  }

  try {
    // Utiliser la vue sécurisée si disponible, sinon la table
    let query = supabase
      .from('profiles_public_secure')
      .select('*', { count: 'exact' })
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order('created_at', { ascending: false });

    // Si la vue n'existe pas, utiliser la table et masquer côté application
    let useSecureView = true;
    const { error: viewError } = await query.limit(0);
    if (viewError) {
      useSecureView = false;
      query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order('created_at', { ascending: false });
    }

    // Apply filters
    if (role) {
      query = query.eq('role', role);
    }
    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    let users: any[] = (data || []).map((profile: any) => ({
      id: profile.id,
      email: profile.email || '',
      full_name: profile.full_name,
      phone: profile.phone,
      avatar_url: profile.avatar_url,
      role: profile.role || 'user',
      is_active: profile.is_active ?? true,
      created_at: profile.created_at,
      last_login: profile.last_login,
      metadata: profile.metadata,
    }));

    // Convertir les rôles owner/editor en user pour le type User
    users = users.map(user => {
      const userRole = user.role;
      return {
        ...user,
        role: (userRole === 'owner' || userRole === 'editor' ? 'user' : userRole) as 'user' | 'agent' | 'admin'
      };
    });

    // Masquer le rôle admin côté application si la vue n'est pas utilisée
    if (!useSecureView) {
      users = users.map(user => {
        const masked = maskAdminRole(
          { ...user, role: user.role as any } as any,
          currentUserId,
          isCurrentUserAdmin
        );
        return {
          ...user,
          role: masked?.role || 'user',
        };
      });
    }

    return {
      data: users.map(u => ({ ...u, role: u.role as 'user' | 'agent' | 'admin' })) as User[],
      count: count || 0,
    };
  } catch (error) {
    errorLog('Error fetching users', error instanceof Error ? error : new Error(String(error)), { options });
    return { data: [], count: 0 };
  }
};

/**
 * Get user by ID
 * NOTE: Le rôle admin est masqué pour les utilisateurs non-admins
 */
export const getUserById = async (
  userId: string,
  currentUserId?: string | null,
  isCurrentUserAdmin?: boolean
): Promise<User | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    // Essayer d'utiliser la vue sécurisée
    let query = supabase
      .from('profiles_public_secure')
      .select('*')
      .eq('id', userId)
      .single();

    let { data, error } = await query;

    // Si la vue n'existe pas, utiliser la table
    if (error) {
      query = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const result = await query;
      data = result.data;
      error = result.error;
    }

    if (error) throw error;
    if (!data) return null;

    let user: User = {
      id: (data as any).id,
      email: (data as any).email || '',
      full_name: (data as any).full_name,
      phone: (data as any).phone,
      avatar_url: (data as any).avatar_url,
      role: ((data as any).role === 'owner' ? 'user' : (data as any).role || 'user') as 'user' | 'agent' | 'admin',
      is_active: (data as any).is_active ?? true,
      created_at: (data as any).created_at,
      last_login: (data as any).last_login,
      metadata: (data as any).metadata,
    };

    // Masquer le rôle admin si nécessaire
    if (currentUserId !== undefined && isCurrentUserAdmin !== undefined) {
      const masked = maskAdminRole(
        { ...user, role: user.role as any } as any,
        currentUserId,
        isCurrentUserAdmin
      );
      if (masked) {
        user.role = masked.role as any;
      }
    }

    return user;
  } catch (error) {
    errorLog('Error fetching user', error instanceof Error ? error : new Error(String(error)), { userId });
    return null;
  }
};

/**
 * Update user
 */
export const updateUser = async (
  userId: string,
  updates: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
    is_active?: boolean;
    role?: 'user' | 'agent' | 'admin';
  }
): Promise<User | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await (supabase
      .from('profiles') as any)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return getUserById(userId);
  } catch (error) {
    errorLog('Error updating user', error instanceof Error ? error : new Error(String(error)), { userId, updates });
    throw error;
  }
};

/**
 * Delete user (soft delete by setting is_active to false)
 */
export const deleteUser = async (userId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await (supabase
      .from('profiles') as any)
      .update({ is_active: false } as any)
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    errorLog('Error deleting user', error instanceof Error ? error : new Error(String(error)), { userId });
    return false;
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (userId: string): Promise<{
  total_properties: number;
  total_inquiries: number;
  total_appointments: number;
  total_reviews: number;
} | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const [properties, inquiries, appointments, reviews] = await Promise.all([
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('owner_id', userId),
      supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('sender_id', userId),
      supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('client_id', userId),
      supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    ]);

    return {
      total_properties: properties.count || 0,
      total_inquiries: inquiries.count || 0,
      total_appointments: appointments.count || 0,
      total_reviews: reviews.count || 0,
    };
  } catch (error) {
    errorLog('Error fetching user stats', error instanceof Error ? error : new Error(String(error)), { userId });
    return null;
  }
};

export default {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
};

