// Niumba - Appointment Service
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { trackAppointment, isHubSpotConfigured } from './hubspotService';
import { errorLog } from '../utils/logHelper';
import { createVideoCall } from './videoCallService';

export interface Appointment {
  id: string;
  property_id: string;
  client_id: string;
  agent_id: string | null;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM
  appointment_type: 'in_person' | 'video_call' | 'phone_call';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  client_notes: string | null;
  created_at: string;
  updated_at: string;
  property?: {
    id: string;
    title: string;
    images: string[];
    address: string;
    latitude: number | null;
    longitude: number | null;
  };
  client?: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
  };
  agent?: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
  };
}

/**
 * Create an appointment
 */
export const createAppointment = async (
  appointmentData: {
    property_id: string;
    client_id: string;
    agent_id?: string;
    appointment_date: string;
    appointment_time: string;
    appointment_type: 'in_person' | 'video_call' | 'phone_call';
    notes?: string;
    client_notes?: string;
  }
): Promise<Appointment | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    // Check if slot is available
    const { data: conflicting } = await supabase
      .from('appointments')
      .select('id')
      .eq('property_id', appointmentData.property_id)
      .eq('appointment_date', appointmentData.appointment_date)
      .eq('appointment_time', appointmentData.appointment_time)
      .in('status', ['pending', 'confirmed']);

    if (conflicting && conflicting.length > 0) {
      throw new Error('This time slot is already booked');
    }

    const { data, error } = await (supabase
      .from('appointments') as any)
      .insert({
        property_id: appointmentData.property_id,
        client_id: appointmentData.client_id,
        agent_id: appointmentData.agent_id || null,
        appointment_date: appointmentData.appointment_date,
        appointment_time: appointmentData.appointment_time,
        appointment_type: appointmentData.appointment_type,
        status: 'pending',
        notes: appointmentData.notes || null,
        client_notes: appointmentData.client_notes || null,
      } as any)
      .select(`
        *,
        property:properties(id, title, images, address, latitude, longitude),
        client:profiles!client_id(id, full_name, email, phone),
        agent:profiles!agent_id(id, full_name, email, phone, avatar_url)
      `)
      .single();

    if (error) throw error;

    // Create video call if appointment type is video_call
    if (appointmentData.appointment_type === 'video_call' && (data as any).id) {
      try {
        await createVideoCall((data as any).id, { provider: 'custom' });
      } catch (videoCallError) {
        // Log error but don't fail the appointment creation
        console.warn('Failed to create video call:', videoCallError);
      }
    }

    // Create notifications
    const { data: property } = await supabase
      .from('properties')
      .select('owner_id, title')
      .eq('id', appointmentData.property_id)
      .single();

    if (property) {
      // Notify property owner
      await supabase.from('notifications').insert({
        user_id: (property as any).owner_id,
        type: 'appointment',
        title: 'Nouveau rendez-vous',
        message: `Un rendez-vous a été demandé pour "${(property as any).title}"`,
        data: {
          appointment_id: (data as any).id,
          property_id: appointmentData.property_id,
        },
      } as any);

      // Notify agent if assigned
      if (appointmentData.agent_id) {
        await supabase.from('notifications').insert({
          user_id: appointmentData.agent_id,
          type: 'appointment',
          title: 'Nouveau rendez-vous assigné',
          message: `Vous avez un nouveau rendez-vous pour "${(property as any).title}"`,
          data: {
            appointment_id: (data as any).id,
            property_id: appointmentData.property_id,
          },
        } as any);
      }

      // Track in HubSpot if configured
      if (isHubSpotConfigured() && (data as any).client && (data as any).property) {
        const client = (data as any).client as any;
        const propertyData = (data as any).property as any;
        await trackAppointment({
          name: client.full_name || 'Unknown',
          email: client.email || '',
          phone: client.phone,
          propertyId: appointmentData.property_id,
          propertyTitle: propertyData.title || 'Unknown Property',
          date: appointmentData.appointment_date,
          time: appointmentData.appointment_time,
          type: appointmentData.appointment_type,
        });
      }
    }

    return data as Appointment;
  } catch (error) {
    errorLog('Error creating appointment', error instanceof Error ? error : new Error(String(error)), { appointmentData });
    throw error;
  }
};

/**
 * Get appointments for a user
 */
export const getUserAppointments = async (
  userId: string,
  options: {
    role?: 'client' | 'agent' | 'owner';
    status?: string;
    upcoming?: boolean;
    past?: boolean;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{ data: Appointment[]; count: number }> => {
  const {
    role,
    status,
    upcoming = false,
    past = false,
    page = 0,
    pageSize = 20,
  } = options;

  if (!isSupabaseConfigured()) {
    return { data: [], count: 0 };
  }

  try {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        property:properties(id, title, images, address, latitude, longitude),
        client:profiles!client_id(id, full_name, email, phone),
        agent:profiles!agent_id(id, full_name, email, phone, avatar_url)
      `, { count: 'exact' });

    // Filter by role
    if (role === 'client') {
      query = query.eq('client_id', userId);
    } else if (role === 'agent') {
      query = query.eq('agent_id', userId);
    } else if (role === 'owner') {
      // Get appointments for properties owned by user
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', userId);

      if (!properties || properties.length === 0) {
        return { data: [], count: 0 };
      }

      query = query.in(
        'property_id',
        (properties as any[]).map((p: any) => (p as any).id)
      );
    } else {
      // Get all appointments where user is client, agent, or owner
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', userId);

      const propertyIds = (properties as any[])?.map((p: any) => (p as any).id) || [];

      query = query.or(
        `client_id.eq.${userId},agent_id.eq.${userId}${
          propertyIds.length > 0 ? `,property_id.in.(${propertyIds.join(',')})` : ''
        }`
      );
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply date filters
    const now = new Date().toISOString().split('T')[0];
    if (upcoming) {
      query = query.or(`appointment_date.gt.${now},and(appointment_date.eq.${now},appointment_time.gte.${new Date().toTimeString().slice(0, 5)})`);
    }
    if (past) {
      query = query.or(`appointment_date.lt.${now},and(appointment_date.eq.${now},appointment_time.lt.${new Date().toTimeString().slice(0, 5)})`);
    }

    query = query
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: (data || []) as Appointment[],
      count: count || 0,
    };
  } catch (error) {
    errorLog('Error fetching appointments', error instanceof Error ? error : new Error(String(error)), { userId, options });
    return { data: [], count: 0 };
  }
};

/**
 * Get available time slots for a property on a specific date
 */
export const getAvailableSlots = async (
  propertyId: string,
  date: string
): Promise<string[]> => {
  if (!isSupabaseConfigured()) {
    // Return default slots
    return ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  }

  try {
    // Get booked slots
    const { data: booked } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('property_id', propertyId)
      .eq('appointment_date', date)
      .in('status', ['pending', 'confirmed']);

    const bookedTimes = new Set(
      (booked || []).map((a: any) => (a as any).appointment_time?.slice(0, 5))
    );

    // Default available slots
    const allSlots = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
    ];

    return allSlots.filter((slot) => !bookedTimes.has(slot));
  } catch (error) {
    errorLog('Error fetching available slots', error instanceof Error ? error : new Error(String(error)), { propertyId, date });
    return ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  }
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (
  appointmentId: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show',
  userId: string
): Promise<Appointment | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    // Verify user has permission
    const { data: appointment } = await supabase
      .from('appointments')
      .select(`
        client_id,
        agent_id,
        property:properties(owner_id)
      `)
      .eq('id', appointmentId)
      .single();

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const appointmentData = appointment as any;
    const isAuthorized =
      appointmentData.client_id === userId ||
      appointmentData.agent_id === userId ||
      (appointmentData.property as any)?.owner_id === userId;

    if (!isAuthorized) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await (supabase
      .from('appointments') as any)
      .update({ status } as any)
      .eq('id', appointmentId)
      .select(`
        *,
        property:properties(id, title, images, address, latitude, longitude),
        client:profiles!client_id(id, full_name, email, phone),
        agent:profiles!agent_id(id, full_name, email, phone, avatar_url)
      `)
      .single();

    if (error) throw error;

    // Create notification for status change
    const notifyUserId =
      (appointment as any).client_id === userId
        ? ((appointment as any).property as any)?.owner_id || (appointment as any).agent_id
        : (appointment as any).client_id;

    if (notifyUserId) {
      await supabase.from('notifications').insert({
        user_id: notifyUserId,
        type: 'appointment_update',
        title: 'Statut du rendez-vous mis à jour',
        message: `Le rendez-vous est maintenant ${status}`,
        data: {
          appointment_id: appointmentId,
        },
      } as any);
    }

    return data as Appointment;
  } catch (error) {
    errorLog('Error updating appointment status', error instanceof Error ? error : new Error(String(error)), { appointmentId, status });
    throw error;
  }
};

/**
 * Update appointment details
 */
export const updateAppointment = async (
  appointmentId: string,
  updates: {
    appointment_date?: string;
    appointment_time?: string;
    appointment_type?: 'in_person' | 'video_call' | 'phone_call';
    notes?: string;
    client_notes?: string;
    agent_id?: string;
  },
  userId: string
): Promise<Appointment | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    // Verify user has permission
    const { data: appointment } = await supabase
      .from('appointments')
      .select('client_id, agent_id, property:properties(owner_id)')
      .eq('id', appointmentId)
      .single();

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const appointmentData = appointment as any;
    const isAuthorized =
      appointmentData.client_id === userId ||
      appointmentData.agent_id === userId ||
      (appointmentData.property as any)?.owner_id === userId;

    if (!isAuthorized) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await (supabase
      .from('appointments') as any)
      .update(updates as any)
      .eq('id', appointmentId)
      .select(`
        *,
        property:properties(id, title, images, address, latitude, longitude),
        client:profiles!client_id(id, full_name, email, phone),
        agent:profiles!agent_id(id, full_name, email, phone, avatar_url)
      `)
      .single();

    if (error) throw error;

    return data as Appointment;
  } catch (error) {
    errorLog('Error updating appointment', error instanceof Error ? error : new Error(String(error)), { appointmentId, updates });
    throw error;
  }
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (
  appointmentId: string,
  userId: string,
  reason?: string
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    const result = await updateAppointmentStatus(
      appointmentId,
      'cancelled',
      userId
    );

    if (result && reason) {
      await (supabase
        .from('appointments') as any)
        .update({ notes: reason } as any)
        .eq('id', appointmentId);
    }

    return !!result;
  } catch (error) {
    errorLog('Error cancelling appointment', error instanceof Error ? error : new Error(String(error)), { appointmentId });
    return false;
  }
};

/**
 * Delete an appointment
 */
export const deleteAppointment = async (
  appointmentId: string,
  userId: string
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    // Verify user has permission (owner or admin)
    const { data: appointment } = await supabase
      .from('appointments')
      .select('property:properties(owner_id)')
      .eq('id', appointmentId)
      .single();

    if (
      !appointment ||
      ((appointment as any).property as any)?.owner_id !== userId
    ) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);

    if (error) throw error;

    return true;
  } catch (error) {
    errorLog('Error deleting appointment', error instanceof Error ? error : new Error(String(error)), { appointmentId });
    return false;
  }
};

export default {
  createAppointment,
  getUserAppointments,
  getAvailableSlots,
  updateAppointmentStatus,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
};

