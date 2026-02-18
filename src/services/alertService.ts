// Niumba - Alert Service
// Service pour gérer les alertes de recherche personnalisées
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { errorLog } from '../utils/logHelper';
import { scheduleLocalNotification } from './notificationService';

export interface PropertyAlert {
  id: string;
  user_id: string;
  name: string;
  enabled: boolean;
  property_type?: 'house' | 'apartment' | 'land' | 'commercial' | 'other';
  transaction_type?: 'sale' | 'rent';
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_bathrooms?: number;
  max_bathrooms?: number;
  min_area?: number;
  max_area?: number;
  city?: string;
  neighborhood?: string;
  match_count: number;
  last_notified?: string;
  last_checked?: string;
  created_at: string;
  updated_at: string;
}

export interface AlertCriteria {
  property_type?: 'house' | 'apartment' | 'land' | 'commercial' | 'other';
  transaction_type?: 'sale' | 'rent';
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_bathrooms?: number;
  max_bathrooms?: number;
  min_area?: number;
  max_area?: number;
  city?: string;
  neighborhood?: string;
}

/**
 * Get all alerts for a user
 */
export const getAlerts = async (userId: string): Promise<PropertyAlert[]> => {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('property_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as PropertyAlert[];
  } catch (error) {
    errorLog('Error fetching alerts', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
};

/**
 * Create a new alert
 */
export const createAlert = async (
  userId: string,
  name: string,
  criteria: AlertCriteria
): Promise<PropertyAlert | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('property_alerts')
      .insert({
        user_id: userId,
        name,
        enabled: true,
        ...criteria,
      })
      .select()
      .single();

    if (error) throw error;

    // Check for matches immediately
    if (data) {
      await checkAlertMatches(data.id);
    }

    return data as PropertyAlert;
  } catch (error) {
    errorLog('Error creating alert', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
};

/**
 * Update an alert
 */
export const updateAlert = async (
  alertId: string,
  updates: Partial<PropertyAlert>
): Promise<PropertyAlert | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('property_alerts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;

    // Recheck matches if criteria changed
    if (updates.enabled !== undefined || updates.property_type || updates.city) {
      await checkAlertMatches(alertId);
    }

    return data as PropertyAlert;
  } catch (error) {
    errorLog('Error updating alert', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
};

/**
 * Delete an alert
 */
export const deleteAlert = async (alertId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('property_alerts')
      .delete()
      .eq('id', alertId);

    if (error) throw error;
    return true;
  } catch (error) {
    errorLog('Error deleting alert', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
};

/**
 * Check for matching properties for an alert
 */
export const checkAlertMatches = async (alertId: string): Promise<number> => {
  if (!isSupabaseConfigured()) return 0;

  try {
    // Get the alert
    const { data: alert, error: alertError } = await supabase
      .from('property_alerts')
      .select('*')
      .eq('id', alertId)
      .single();

    if (alertError || !alert || !alert.enabled) return 0;

    // Build query for matching properties
    let query = supabase
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');

    // Apply filters
    if (alert.property_type) {
      query = query.eq('property_type', alert.property_type);
    }

    if (alert.transaction_type) {
      query = query.eq('transaction_type', alert.transaction_type);
    }

    if (alert.min_price) {
      query = query.gte('price', alert.min_price);
    }

    if (alert.max_price) {
      query = query.lte('price', alert.max_price);
    }

    if (alert.min_bedrooms) {
      query = query.gte('bedrooms', alert.min_bedrooms);
    }

    if (alert.max_bedrooms) {
      query = query.lte('bedrooms', alert.max_bedrooms);
    }

    if (alert.min_bathrooms) {
      query = query.gte('bathrooms', alert.min_bathrooms);
    }

    if (alert.max_bathrooms) {
      query = query.lte('bathrooms', alert.max_bathrooms);
    }

    if (alert.min_area) {
      query = query.gte('area', alert.min_area);
    }

    if (alert.max_area) {
      query = query.lte('area', alert.max_area);
    }

    if (alert.city) {
      query = query.eq('city', alert.city);
    }

    if (alert.neighborhood) {
      query = query.eq('neighborhood', alert.neighborhood);
    }

    // Only count properties created after last notification
    if (alert.last_notified) {
      query = query.gt('created_at', alert.last_notified);
    }

    const { count, error } = await query;

    if (error) throw error;

    const matchCount = count || 0;

    // Update alert with match count
    await supabase
      .from('property_alerts')
      .update({
        match_count: matchCount,
        last_checked: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    // Send notification if there are new matches (only if not already notified)
    if (matchCount > 0) {
      // Only notify if this is the first check or if there are new matches since last notification
      const shouldNotify = !alert.last_notified || matchCount > (alert.match_count || 0);
      
      if (shouldNotify) {
        try {
          await scheduleLocalNotification(
            'Nouvelles propriétés trouvées ! 🏠',
            `${matchCount} nouvelle(s) propriété(s) correspond(ent) à votre alerte "${alert.name}"`,
            { type: 'alert_match', alertId: alertId, matchCount }
          );
        } catch (notifError) {
          console.warn('Failed to send alert notification:', notifError);
        }
      }
    }

    return matchCount;
  } catch (error) {
    errorLog('Error checking alert matches', error instanceof Error ? error : new Error(String(error)));
    return 0;
  }
};

/**
 * Get matching properties for an alert
 */
export const getAlertMatches = async (alertId: string): Promise<any[]> => {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data: alert, error: alertError } = await supabase
      .from('property_alerts')
      .select('*')
      .eq('id', alertId)
      .single();

    if (alertError || !alert || !alert.enabled) return [];

    // Build query for matching properties
    let query = supabase
      .from('properties')
      .select('*')
      .eq('status', 'active');

    // Apply filters (same as checkAlertMatches)
    if (alert.property_type) {
      query = query.eq('property_type', alert.property_type);
    }

    if (alert.transaction_type) {
      query = query.eq('transaction_type', alert.transaction_type);
    }

    if (alert.min_price) {
      query = query.gte('price', alert.min_price);
    }

    if (alert.max_price) {
      query = query.lte('price', alert.max_price);
    }

    if (alert.min_bedrooms) {
      query = query.gte('bedrooms', alert.min_bedrooms);
    }

    if (alert.max_bedrooms) {
      query = query.lte('bedrooms', alert.max_bedrooms);
    }

    if (alert.min_bathrooms) {
      query = query.gte('bathrooms', alert.min_bathrooms);
    }

    if (alert.max_bathrooms) {
      query = query.lte('bathrooms', alert.max_bathrooms);
    }

    if (alert.min_area) {
      query = query.gte('area', alert.min_area);
    }

    if (alert.max_area) {
      query = query.lte('area', alert.max_area);
    }

    if (alert.city) {
      query = query.eq('city', alert.city);
    }

    if (alert.neighborhood) {
      query = query.eq('neighborhood', alert.neighborhood);
    }

    // Only get properties created after last notification
    if (alert.last_notified) {
      query = query.gt('created_at', alert.last_notified);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    errorLog('Error getting alert matches', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
};

/**
 * Mark alert as notified (after sending notification)
 */
export const markAlertAsNotified = async (alertId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('property_alerts')
      .update({
        last_notified: new Date().toISOString(),
        match_count: 0, // Reset after notification
        updated_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (error) throw error;
    return true;
  } catch (error) {
    errorLog('Error marking alert as notified', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
};

/**
 * Check all enabled alerts for a user
 */
export const checkAllUserAlerts = async (userId: string): Promise<number> => {
  if (!isSupabaseConfigured()) return 0;

  try {
    const { data: alerts, error } = await supabase
      .from('property_alerts')
      .select('id')
      .eq('user_id', userId)
      .eq('enabled', true);

    if (error) throw error;

    let totalMatches = 0;
    for (const alert of alerts || []) {
      const matches = await checkAlertMatches(alert.id);
      totalMatches += matches;
    }

    return totalMatches;
  } catch (error) {
    errorLog('Error checking all user alerts', error instanceof Error ? error : new Error(String(error)));
    return 0;
  }
};

export default {
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  checkAlertMatches,
  getAlertMatches,
  markAlertAsNotified,
  checkAllUserAlerts,
};

