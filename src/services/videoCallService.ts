// Niumba - Video Call Service
// Gère la création et la gestion des appels vidéo pour les rendez-vous
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { errorLog } from '../utils/logHelper';

export interface VideoCall {
  id: string;
  appointment_id: string;
  meeting_url: string;
  meeting_id: string;
  meeting_password?: string;
  provider: 'zoom' | 'google_meet' | 'custom';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  started_at?: string;
  ended_at?: string;
}

/**
 * Generate a unique meeting ID
 */
const generateMeetingId = (): string => {
  return `NIUMBA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

/**
 * Generate a meeting password (optional)
 */
const generateMeetingPassword = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create a video call link for an appointment
 * For now, we'll generate a custom meeting URL
 * In production, you can integrate with Zoom, Google Meet, or Twilio
 */
export const createVideoCall = async (
  appointmentId: string,
  options?: {
    provider?: 'zoom' | 'google_meet' | 'custom';
    duration?: number; // in minutes
  }
): Promise<VideoCall | null> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, video call not created');
    return null;
  }

  try {
    const meetingId = generateMeetingId();
    const password = generateMeetingPassword();
    const provider = options?.provider || 'custom';

    // Generate meeting URL based on provider
    let meetingUrl = '';
    switch (provider) {
      case 'zoom':
        // Format: https://zoom.us/j/{meeting_id}?pwd={password}
        meetingUrl = `https://zoom.us/j/${meetingId}?pwd=${password}`;
        break;
      case 'google_meet':
        // Format: https://meet.google.com/{meeting_id}
        meetingUrl = `https://meet.google.com/${meetingId}`;
        break;
      case 'custom':
      default:
        // Custom meeting URL - you can integrate with your own WebRTC solution
        // For now, we'll use a placeholder that can be replaced with actual implementation
        meetingUrl = `niumba://video-call/${meetingId}`;
        break;
    }

    // Insert video call record
    const { data, error } = await supabase
      .from('video_calls')
      .insert({
        appointment_id: appointmentId,
        meeting_url: meetingUrl,
        meeting_id: meetingId,
        meeting_password: password,
        provider: provider,
        status: 'scheduled',
      })
      .select()
      .single();

    if (error) {
      // Si la table n'existe pas encore, on log l'erreur mais on ne fait pas échouer
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('Table video_calls does not exist yet. Please run CREATE_VIDEO_CALLS_TABLE.sql in Supabase.');
        return null;
      }
      throw error;
    }

    // Update appointment with video_url if it exists
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ video_url: meetingUrl })
      .eq('id', appointmentId);

    if (updateError) {
      console.warn('Failed to update appointment video_url:', updateError);
    }

    return data as VideoCall;
  } catch (error) {
    errorLog('createVideoCall', error);
    return null;
  }
};

/**
 * Get video call for an appointment
 */
export const getVideoCallByAppointment = async (
  appointmentId: string
): Promise<VideoCall | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('video_calls')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No video call found
        return null;
      }
      throw error;
    }

    return data as VideoCall;
  } catch (error) {
    errorLog('getVideoCallByAppointment', error);
    return null;
  }
};

/**
 * Start a video call (mark as active)
 */
export const startVideoCall = async (videoCallId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('video_calls')
      .update({
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .eq('id', videoCallId);

    if (error) throw error;
    return true;
  } catch (error) {
    errorLog('startVideoCall', error);
    return false;
  }
};

/**
 * End a video call (mark as completed)
 */
export const endVideoCall = async (videoCallId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('video_calls')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
      })
      .eq('id', videoCallId);

    if (error) throw error;
    return true;
  } catch (error) {
    errorLog('endVideoCall', error);
    return false;
  }
};

/**
 * Cancel a video call
 */
export const cancelVideoCall = async (videoCallId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('video_calls')
      .update({
        status: 'cancelled',
      })
      .eq('id', videoCallId);

    if (error) throw error;
    return true;
  } catch (error) {
    errorLog('cancelVideoCall', error);
    return false;
  }
};

/**
 * Get or create video call for an appointment
 * If no video call exists, creates one automatically
 */
export const getOrCreateVideoCall = async (
  appointmentId: string
): Promise<VideoCall | null> => {
  // Try to get existing video call
  let videoCall = await getVideoCallByAppointment(appointmentId);

  // If no video call exists, create one
  if (!videoCall) {
    videoCall = await createVideoCall(appointmentId);
  }

  return videoCall;
};

export default {
  createVideoCall,
  getVideoCallByAppointment,
  startVideoCall,
  endVideoCall,
  cancelVideoCall,
  getOrCreateVideoCall,
};

