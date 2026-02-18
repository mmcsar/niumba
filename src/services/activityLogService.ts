// Niumba - Activity Log Service
// Service pour enregistrer les activités des éditeurs et permettre à l'admin de les surveiller
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { errorLog } from '../utils/logHelper';

export interface ActivityLog {
  id?: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  resource_type: 'property' | 'agent' | 'user' | 'appointment';
  resource_id: string;
  resource_name: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

/**
 * Log an activity
 */
export const logActivity = async (activity: Omit<ActivityLog, 'id' | 'created_at'>): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    // In demo mode, just log to console
    console.log('[Activity Log]', activity);
    return true;
  }

  try {
    // Ensure details is a valid JSON object
    let detailsPayload: any = {};
    if (activity.details) {
      if (typeof activity.details === 'string') {
        try {
          detailsPayload = JSON.parse(activity.details);
        } catch {
          detailsPayload = {};
        }
      } else if (typeof activity.details === 'object') {
        detailsPayload = activity.details;
      }
    }

    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: activity.user_id,
        user_name: activity.user_name,
        user_role: activity.user_role,
        action: activity.action,
        resource_type: activity.resource_type,
        resource_id: activity.resource_id,
        resource_name: activity.resource_name,
        details: detailsPayload,
        ip_address: activity.ip_address,
        user_agent: activity.user_agent,
      } as any);

    if (error) {
      errorLog('Error logging activity', error instanceof Error ? error : new Error(String(error)), { activity });
      return false;
    }

    return true;
  } catch (error) {
    errorLog('Error logging activity', error instanceof Error ? error : new Error(String(error)), { activity });
    return false;
  }
};

/**
 * Get activity logs with filters
 */
export const getActivityLogs = async (options: {
  userId?: string;
  role?: string;
  action?: ActivityLog['action'];
  resourceType?: ActivityLog['resource_type'];
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<{ data: ActivityLog[]; count: number }> => {
  const {
    userId,
    role,
    action,
    resourceType,
    startDate,
    endDate,
    page = 0,
    pageSize = 50,
  } = options;

  if (!isSupabaseConfigured()) {
    return { data: [], count: 0 };
  }

  try {
    let query = supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (role) {
      query = query.eq('user_role', role);
    }

    if (action) {
      query = query.eq('action', action);
    }

    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // Transform data: ensure details is properly parsed from JSONB
    const transformedData = (data || []).map((log: any) => ({
      ...log,
      details: typeof log.details === 'string' 
        ? (() => {
            try {
              return JSON.parse(log.details);
            } catch {
              return {};
            }
          })()
        : (log.details || {}),
    })) as ActivityLog[];

    return {
      data: transformedData,
      count: count || 0,
    };
  } catch (error) {
    errorLog('Error fetching activity logs', error instanceof Error ? error : new Error(String(error)), { options });
    return { data: [], count: 0 };
  }
};

/**
 * Get activity logs for a specific user (for editors to see their own activities)
 */
export const getUserActivityLogs = async (userId: string, page: number = 0, pageSize: number = 20): Promise<{ data: ActivityLog[]; count: number }> => {
  return getActivityLogs({ userId, page, pageSize });
};

/**
 * Get activity logs for editors (for admin to monitor)
 */
export const getEditorActivityLogs = async (options: {
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<{ data: ActivityLog[]; count: number }> => {
  return getActivityLogs({ role: 'editor', ...options });
};

