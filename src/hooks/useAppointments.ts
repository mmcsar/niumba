// Niumba - Appointments Hook
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  createAppointment,
  getUserAppointments,
  getAvailableSlots,
  updateAppointmentStatus,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
  type Appointment,
} from '../services/appointmentService';
import { errorLog } from '../utils/logHelper';

export const useAppointments = (options: {
  role?: 'client' | 'agent' | 'owner';
  status?: string;
  upcoming?: boolean;
  past?: boolean;
} = {}) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const { data } = await getUserAppointments(user.id, options);
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [user, options]);

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user, loadAppointments]);

  return {
    appointments,
    loading,
    error,
    refresh: loadAppointments,
  };
};

export const useCreateAppointment = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (
    appointmentData: {
      property_id: string;
      appointment_date: string;
      appointment_time: string;
      appointment_type: 'in_person' | 'video_call' | 'phone_call';
      agent_id?: string;
      notes?: string;
      client_notes?: string;
    }
  ): Promise<Appointment | null> => {
    if (!user) {
      const errorMsg = 'Vous devez être connecté pour prendre un rendez-vous';
      setError(errorMsg);
      console.error('createAppointment: User not logged in');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Creating appointment with data:', { ...appointmentData, client_id: user.id });
      
      const appointment = await createAppointment({
        ...appointmentData,
        client_id: user.id,
      });
      
      if (!appointment) {
        throw new Error('Failed to create appointment - no data returned');
      }
      
      console.log('Appointment created successfully:', appointment.id);
      return appointment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du rendez-vous';
      console.error('Error creating appointment:', err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { create, loading, error };
};

export const usePropertySlots = (propertyId: string, date: string) => {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSlots = useCallback(async () => {
    if (!propertyId || !date) return;

    try {
      setLoading(true);
      const available = await getAvailableSlots(propertyId, date);
      setSlots(available);
    } catch (err) {
      errorLog('Error loading slots in usePropertySlots', err instanceof Error ? err : new Error(String(err)), { propertyId, date });
    } finally {
      setLoading(false);
    }
  }, [propertyId, date]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  return { slots, loading, refresh: loadSlots };
};

export const useManageAppointment = (appointmentId: string) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(async (
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  ): Promise<Appointment | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);
      const appointment = await updateAppointmentStatus(appointmentId, status, user.id);
      return appointment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, appointmentId]);

  const update = useCallback(async (
    updates: {
      appointment_date?: string;
      appointment_time?: string;
      appointment_type?: 'in_person' | 'video_call' | 'phone_call';
      notes?: string;
      client_notes?: string;
      agent_id?: string;
    }
  ): Promise<Appointment | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);
      const appointment = await updateAppointment(appointmentId, updates, user.id);
      return appointment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, appointmentId]);

  const cancel = useCallback(async (reason?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      const success = await cancelAppointment(appointmentId, user.id, reason);
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, appointmentId]);

  const remove = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      const success = await deleteAppointment(appointmentId, user.id);
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, appointmentId]);

  return {
    updateStatus,
    update,
    cancel,
    remove,
    loading,
    error,
  };
};

export default useAppointments;



