// Niumba - Analytics Stats Service
// Service pour récupérer les statistiques analytiques depuis Supabase
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { errorLog } from '../utils/logHelper';

export interface AnalyticsStats {
  views: number;
  viewsGrowth: number;
  inquiries: number;
  inquiriesGrowth: number;
  properties: number;
  propertiesGrowth: number;
  users: number;
  usersGrowth: number;
  agents: number;
  agentsGrowth: number;
  appointments: number;
  appointmentsGrowth: number;
}

export interface TopProperty {
  id: string;
  title: string;
  views: number;
  inquiries: number;
}

export interface DailyStats {
  date: string;
  views: number;
  inquiries: number;
  properties: number;
}

/**
 * Get analytics stats for a period
 */
export const getAnalyticsStats = async (
  period: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<AnalyticsStats> => {
  if (!isSupabaseConfigured()) {
    return {
      views: 0,
      viewsGrowth: 0,
      inquiries: 0,
      inquiriesGrowth: 0,
      properties: 0,
      propertiesGrowth: 0,
      users: 0,
      usersGrowth: 0,
      agents: 0,
      agentsGrowth: 0,
      appointments: 0,
      appointmentsGrowth: 0,
    };
  }

  try {
    const now = new Date();
    const currentPeriodStart = getPeriodStart(now, period);
    const previousPeriodStart = getPeriodStart(
      new Date(currentPeriodStart.getTime() - getPeriodDuration(period)),
      period
    );
    const previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1);

    // Get current period stats
    const [
      currentViews,
      currentInquiries,
      currentProperties,
      currentUsers,
      currentAgents,
      currentAppointments,
    ] = await Promise.all([
      getViewsCount(currentPeriodStart, now),
      getInquiriesCount(currentPeriodStart, now),
      getPropertiesCount(currentPeriodStart, now),
      getUsersCount(currentPeriodStart, now),
      getAgentsCount(currentPeriodStart, now),
      getAppointmentsCount(currentPeriodStart, now),
    ]);

    // Get previous period stats
    const [
      previousViews,
      previousInquiries,
      previousProperties,
      previousUsers,
      previousAgents,
      previousAppointments,
    ] = await Promise.all([
      getViewsCount(previousPeriodStart, previousPeriodEnd),
      getInquiriesCount(previousPeriodStart, previousPeriodEnd),
      getPropertiesCount(previousPeriodStart, previousPeriodEnd),
      getUsersCount(previousPeriodStart, previousPeriodEnd),
      getAgentsCount(previousPeriodStart, previousPeriodEnd),
      getAppointmentsCount(previousPeriodStart, previousPeriodEnd),
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      views: currentViews,
      viewsGrowth: calculateGrowth(currentViews, previousViews),
      inquiries: currentInquiries,
      inquiriesGrowth: calculateGrowth(currentInquiries, previousInquiries),
      properties: currentProperties,
      propertiesGrowth: calculateGrowth(currentProperties, previousProperties),
      users: currentUsers,
      usersGrowth: calculateGrowth(currentUsers, previousUsers),
      agents: currentAgents,
      agentsGrowth: calculateGrowth(currentAgents, previousAgents),
      appointments: currentAppointments,
      appointmentsGrowth: calculateGrowth(currentAppointments, previousAppointments),
    };
  } catch (error) {
    errorLog('Error fetching analytics stats', error instanceof Error ? error : new Error(String(error)));
    return {
      views: 0,
      viewsGrowth: 0,
      inquiries: 0,
      inquiriesGrowth: 0,
      properties: 0,
      propertiesGrowth: 0,
      users: 0,
      usersGrowth: 0,
      agents: 0,
      agentsGrowth: 0,
      appointments: 0,
      appointmentsGrowth: 0,
    };
  }
};

/**
 * Get top properties by views and inquiries
 */
export const getTopProperties = async (limit: number = 10): Promise<TopProperty[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('properties')
      .select('id, title, views')
      .eq('status', 'active')
      .order('views', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Get inquiries count for each property
    const propertiesWithInquiries = await Promise.all(
      (data || []).map(async (property) => {
        const { count } = await supabase
          .from('inquiries')
          .select('*', { count: 'exact', head: true })
          .eq('property_id', property.id);

        return {
          id: property.id,
          title: property.title || 'Untitled Property',
          views: property.views || 0,
          inquiries: count || 0,
        };
      })
    );

    return propertiesWithInquiries;
  } catch (error) {
    errorLog('Error fetching top properties', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
};

/**
 * Get daily stats for a period
 */
export const getDailyStats = async (
  period: 'week' | 'month' | 'year' = 'month'
): Promise<DailyStats[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const now = new Date();
    const periodStart = getPeriodStart(now, period);
    const days = getDaysInPeriod(periodStart, now);

    const stats = await Promise.all(
      days.map(async (date) => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const [views, inquiries, properties] = await Promise.all([
          getViewsCount(dayStart, dayEnd),
          getInquiriesCount(dayStart, dayEnd),
          getPropertiesCount(dayStart, dayEnd),
        ]);

        return {
          date: date.toISOString().split('T')[0],
          views,
          inquiries,
          properties,
        };
      })
    );

    return stats;
  } catch (error) {
    errorLog('Error fetching daily stats', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
};

// Helper functions
function getPeriodStart(date: Date, period: 'day' | 'week' | 'month' | 'year'): Date {
  const start = new Date(date);
  switch (period) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;
  }
  return start;
}

function getPeriodDuration(period: 'day' | 'week' | 'month' | 'year'): number {
  switch (period) {
    case 'day':
      return 24 * 60 * 60 * 1000;
    case 'week':
      return 7 * 24 * 60 * 60 * 1000;
    case 'month':
      return 30 * 24 * 60 * 60 * 1000;
    case 'year':
      return 365 * 24 * 60 * 60 * 1000;
  }
}

function getDaysInPeriod(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

async function getViewsCount(start: Date, end: Date): Promise<number> {
  try {
    const { count } = await supabase
      .from('property_views')
      .select('*', { count: 'exact', head: true })
      .gte('viewed_at', start.toISOString())
      .lte('viewed_at', end.toISOString());
    return count || 0;
  } catch {
    return 0;
  }
}

async function getInquiriesCount(start: Date, end: Date): Promise<number> {
  try {
    const { count } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());
    return count || 0;
  } catch {
    return 0;
  }
}

async function getPropertiesCount(start: Date, end: Date): Promise<number> {
  try {
    const { count } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());
    return count || 0;
  } catch {
    return 0;
  }
}

async function getUsersCount(start: Date, end: Date): Promise<number> {
  try {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());
    return count || 0;
  } catch {
    return 0;
  }
}

async function getAgentsCount(start: Date, end: Date): Promise<number> {
  try {
    const { count } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());
    return count || 0;
  } catch {
    return 0;
  }
}

async function getAppointmentsCount(start: Date, end: Date): Promise<number> {
  try {
    const { count } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());
    return count || 0;
  } catch {
    return 0;
  }
}

