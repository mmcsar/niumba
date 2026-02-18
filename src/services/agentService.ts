// Niumba - Agent Service
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { errorLog, warnLog } from '../utils/logHelper';

export interface Agent {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  agency_name: string | null;
  license_number: string | null;
  bio: string | null;
  specializations: string[] | null;
  regions: string[] | null;
  is_active: boolean;
  is_verified: boolean;
  is_suspended: boolean;
  suspended_at: string | null;
  suspended_reason: string | null;
  created_at: string;
  updated_at: string;
  stats?: {
    total_properties: number;
    active_listings: number;
    total_sales: number;
    total_inquiries: number;
    average_rating: number;
    total_reviews: number;
  };
}

export interface AgentStats {
  total_properties: number;
  active_listings: number;
  total_sales: number;
  total_inquiries: number;
  average_rating: number;
  total_reviews: number;
}

/**
 * Get all agents with optional filters
 */
export const getAgents = async (options: {
  page?: number;
  pageSize?: number;
  isActive?: boolean;
  isVerified?: boolean;
  isSuspended?: boolean;
  search?: string;
} = {}): Promise<{ data: Agent[]; count: number }> => {
  const { page = 0, pageSize = 20, isActive, isVerified, isSuspended, search } = options;

  if (!isSupabaseConfigured()) {
    return { data: [], count: 0 };
  }

  try {
    // Join profiles with agents table
    let query = supabase
      .from('agents')
      .select(`
        *,
        profile:profiles!user_id(id, email, full_name, phone, avatar_url, created_at, updated_at)
      `, { count: 'exact' })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    // Apply filters
    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }
    if (isVerified !== undefined) {
      query = query.eq('is_verified', isVerified);
    }
    if (isSuspended !== undefined) {
      query = query.eq('is_suspended', isSuspended);
    }
    if (search) {
      query = query.or(`license_number.ilike.%${search}%,profile.full_name.ilike.%${search}%,profile.email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      // Handle table not found error gracefully
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        warnLog('Agents table not found in Supabase. Please create the table or configure Supabase.');
        return { data: [], count: 0 };
      }
      throw error;
    }

    // Transform data to match Agent interface
    const agents: Agent[] = (data || []).map((agent: any) => ({
      id: agent.user_id,
      user_id: agent.user_id,
      full_name: agent.profile?.full_name || '',
      email: agent.profile?.email || '',
      phone: agent.profile?.phone,
      avatar_url: agent.profile?.avatar_url,
      agency_name: null, // Not in schema, can be added later
      license_number: agent.license_number,
      bio: agent.bio,
      specializations: agent.specializations || [],
      regions: agent.service_areas || [], // service_areas in schema
      is_active: agent.is_active ?? true,
      is_verified: agent.is_verified ?? false,
      is_suspended: agent.is_suspended ?? false,
      suspended_at: agent.suspended_at || null,
      suspended_reason: agent.suspended_reason || null,
      created_at: agent.profile?.created_at || agent.created_at,
      updated_at: agent.updated_at,
    }));

    return {
      data: agents,
      count: count || 0,
    };
  } catch (error) {
    errorLog('Error fetching agents', error instanceof Error ? error : new Error(String(error)), { errorDetails: error });
    return { data: [], count: 0 };
  }
};

/**
 * Get agent by ID
 */
export const getAgentById = async (agentId: string): Promise<Agent | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('agents')
      .select(`
        *,
        profile:profiles!user_id(id, email, full_name, phone, avatar_url, created_at, updated_at)
      `)
      .eq('user_id', agentId)
      .single();

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        warnLog('Agents table not found in Supabase.');
        return null;
      }
      throw error;
    }
    if (!data) return null;

    return {
      id: (data as any).user_id,
      user_id: (data as any).user_id,
      full_name: ((data as any).profile as any)?.full_name || '',
      email: ((data as any).profile as any)?.email || '',
      phone: ((data as any).profile as any)?.phone,
      avatar_url: ((data as any).profile as any)?.avatar_url,
      agency_name: null, // Not in schema
      license_number: (data as any).license_number,
      bio: (data as any).bio,
      specializations: (data as any).specializations || [],
      regions: (data as any).service_areas || [],
      is_active: (data as any).is_active ?? true,
      is_verified: (data as any).is_verified ?? false,
      is_suspended: (data as any).is_suspended ?? false,
      suspended_at: (data as any).suspended_at || null,
      suspended_reason: (data as any).suspended_reason || null,
      created_at: ((data as any).profile as any)?.created_at || (data as any).created_at,
      updated_at: (data as any).updated_at,
    };
  } catch (error) {
    errorLog('Error fetching agent', error instanceof Error ? error : new Error(String(error)), { agentId });
    return null;
  }
};

/**
 * Get agent statistics
 */
export const getAgentStats = async (agentId: string): Promise<AgentStats | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    // Get properties count
    const { count: totalProperties } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', agentId);

    const { count: activeListings } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', agentId)
      .eq('status', 'active');

    // Get inquiries count
    const { count: totalInquiries } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', agentId);

    // Get reviews stats
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('property_id', agentId); // This would need to be adjusted based on your schema

    const totalReviews = reviews?.length || 0;
    const averageRating = reviews && reviews.length > 0
      ? reviews.reduce((acc, r) => acc + ((r as any).rating || 0), 0) / reviews.length
      : 0;

    return {
      total_properties: totalProperties || 0,
      active_listings: activeListings || 0,
      total_sales: 0, // Would need a sales table
      total_inquiries: totalInquiries || 0,
      average_rating: Math.round(averageRating * 10) / 10,
      total_reviews: totalReviews,
    };
  } catch (error) {
    errorLog('Error fetching agent stats', error instanceof Error ? error : new Error(String(error)), { agentId });
    return null;
  }
};

/**
 * Create or update agent
 */
export const upsertAgent = async (
  agentData: {
    user_id: string;
    agency_name?: string;
    license_number?: string;
    bio?: string;
    specializations?: string[];
    regions?: string[];
    is_active?: boolean;
    is_verified?: boolean;
  }
): Promise<Agent | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('agents')
      .upsert({
        user_id: agentData.user_id,
        license_number: agentData.license_number || null,
        bio: agentData.bio || null,
        specializations: agentData.specializations || [],
        service_areas: agentData.regions || [], // Map regions to service_areas
        is_active: agentData.is_active ?? true,
        is_verified: agentData.is_verified ?? false,
        updated_at: new Date().toISOString(),
      } as any)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        warnLog('Agents table not found in Supabase.');
        return null;
      }
      throw error;
    }

    return getAgentById(agentData.user_id);
  } catch (error) {
    errorLog('Error upserting agent', error instanceof Error ? error : new Error(String(error)), { agentData });
    throw error;
  }
};

/**
 * Update agent status
 */
export const updateAgentStatus = async (
  agentId: string,
  updates: {
    is_active?: boolean;
    is_verified?: boolean;
    is_suspended?: boolean;
    suspended_reason?: string | null;
  }
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Handle suspension
    if (updates.is_suspended !== undefined) {
      if (updates.is_suspended) {
        updateData.suspended_at = new Date().toISOString();
        updateData.suspended_reason = updates.suspended_reason || 'Suspended by admin';
      } else {
        updateData.suspended_at = null;
        updateData.suspended_reason = null;
      }
    }

    const { error } = await (supabase
      .from('agents') as any)
      .update(updateData as any)
      .eq('user_id', agentId);

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        warnLog('Agents table not found in Supabase.');
        return false;
      }
      throw error;
    }
    return true;
  } catch (error) {
    errorLog('Error updating agent status', error instanceof Error ? error : new Error(String(error)), { agentId, status });
    return false;
  }
};

/**
 * Delete agent profile
 */
export const deleteAgent = async (agentId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('user_id', agentId);

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        warnLog('Agents table not found in Supabase.');
        return false;
      }
      throw error;
    }
    return true;
  } catch (error) {
    errorLog('Error deleting agent', error instanceof Error ? error : new Error(String(error)), { agentId });
    return false;
  }
};

/**
 * Suspend an agent (Admin only)
 * Logs the activity for security monitoring
 */
export const suspendAgent = async (
  agentId: string,
  reason: string,
  adminId: string,
  adminName: string
): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    // Get agent info for logging
    const agent = await getAgentById(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Suspend the agent
    const success = await updateAgentStatus(agentId, {
      is_suspended: true,
      suspended_reason: reason,
    });

    if (success) {
      // Log the suspension activity
      const { logActivity } = await import('./activityLogService');
      await logActivity({
        user_id: adminId,
        user_name: adminName,
        user_role: 'admin',
        action: 'update',
        resource_type: 'agent',
        resource_id: agentId,
        resource_name: agent.full_name,
        details: {
          action: 'suspend',
          reason,
          previous_status: {
            is_suspended: false,
          },
          new_status: {
            is_suspended: true,
            suspended_reason: reason,
          },
        },
      });
    }

    return success;
  } catch (error) {
    errorLog('Error suspending agent', error instanceof Error ? error : new Error(String(error)), { agentId, reason });
    return false;
  }
};

/**
 * Unsuspend an agent (Admin only)
 */
export const unsuspendAgent = async (
  agentId: string,
  adminId: string,
  adminName: string
): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    // Get agent info for logging
    const agent = await getAgentById(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Unsuspend the agent
    const success = await updateAgentStatus(agentId, {
      is_suspended: false,
      suspended_reason: null,
    });

    if (success) {
      // Log the unsuspension activity
      const { logActivity } = await import('./activityLogService');
      await logActivity({
        user_id: adminId,
        user_name: adminName,
        user_role: 'admin',
        action: 'update',
        resource_type: 'agent',
        resource_id: agentId,
        resource_name: agent.full_name,
        details: {
          action: 'unsuspend',
          previous_status: {
            is_suspended: true,
            suspended_reason: (agent as any).suspended_reason,
          },
          new_status: {
            is_suspended: false,
          },
        },
      });
    }

    return success;
  } catch (error) {
    errorLog('Error unsuspending agent', error instanceof Error ? error : new Error(String(error)), { agentId });
    return false;
  }
};

export default {
  getAgents,
  getAgentById,
  getAgentStats,
  upsertAgent,
  updateAgentStatus,
  deleteAgent,
  suspendAgent,
  unsuspendAgent,
};

