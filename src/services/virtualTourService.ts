// Niumba - Virtual Tour Service
// Handles virtual tour rooms and panoramas for properties

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { errorLog, warnLog } from '../utils/logHelper';

export interface VirtualTourRoom {
  id: string;
  property_id: string;
  name: string;
  name_en?: string;
  panorama_url: string;
  thumbnail_url: string;
  order_index?: number;
  hotspots?: VirtualTourHotspot[];
  created_at?: string;
  updated_at?: string;
}

export interface VirtualTourHotspot {
  id: string;
  room_id: string;
  x: number; // Percentage (0-100)
  y: number; // Percentage (0-100)
  target_room_id?: string;
  label?: string;
  label_en?: string;
  type: 'navigation' | 'info';
  info_content?: string;
  created_at?: string;
}

/**
 * Get all virtual tour rooms for a property
 * Falls back to virtual_tour_url from properties table if virtual_tour_rooms doesn't exist
 */
export const getPropertyTourRooms = async (
  propertyId: string
): Promise<VirtualTourRoom[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    // First, try to get from virtual_tour_rooms table if it exists
    const { data, error } = await supabase
      .from('virtual_tour_rooms')
      .select(`
        *,
        hotspots:virtual_tour_hotspots(*)
      `)
      .eq('property_id', propertyId)
      .order('order_index', { ascending: true });

    if (error) {
      // Handle table not found error gracefully - fallback to properties.virtual_tour_url
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        warnLog('Virtual tour rooms table not found. Checking properties.virtual_tour_url...');
        
        // Fallback: Check if property has virtual_tour_url
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select('virtual_tour_url')
          .eq('id', propertyId)
          .single();

        if (!propertyError && (propertyData as any)?.virtual_tour_url) {
          // Return a single room with the virtual_tour_url
          return [{
            id: `${propertyId}-tour`,
            property_id: propertyId,
            name: 'Tour Virtuel',
            name_en: 'Virtual Tour',
            panorama_url: (propertyData as any).virtual_tour_url,
            thumbnail_url: (propertyData as any).virtual_tour_url,
            order_index: 0,
            hotspots: [],
          }];
        }
        
        return [];
      }
      throw error;
    }

    // Transform data to match interface
    const rooms: VirtualTourRoom[] = (data || []).map((room: any) => ({
      id: room.id,
      property_id: room.property_id,
      name: room.name,
      name_en: room.name_en,
      panorama_url: room.panorama_url,
      thumbnail_url: room.thumbnail_url,
      order_index: room.order_index,
      hotspots: (room.hotspots || []).map((hotspot: any) => ({
        id: hotspot.id,
        room_id: hotspot.room_id,
        x: hotspot.x,
        y: hotspot.y,
        target_room_id: hotspot.target_room_id,
        label: hotspot.label,
        label_en: hotspot.label_en,
        type: hotspot.type as 'navigation' | 'info',
        info_content: hotspot.info_content,
      })),
      created_at: room.created_at,
      updated_at: room.updated_at,
    }));

    return rooms;
  } catch (error) {
    errorLog('Error fetching virtual tour rooms', error instanceof Error ? error : new Error(String(error)), { propertyId });
    return [];
  }
};

/**
 * Get a single virtual tour room by ID
 */
export const getTourRoomById = async (
  roomId: string
): Promise<VirtualTourRoom | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('virtual_tour_rooms')
      .select(`
        *,
        hotspots:virtual_tour_hotspots(*)
      `)
      .eq('id', roomId)
      .single();

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        return null;
      }
      throw error;
    }

    if (!data) return null;

    return {
      id: (data as any).id,
      property_id: (data as any).property_id,
      name: (data as any).name,
      name_en: (data as any).name_en,
      panorama_url: (data as any).panorama_url,
      thumbnail_url: (data as any).thumbnail_url,
      order_index: (data as any).order_index,
      hotspots: ((data as any).hotspots || []).map((hotspot: any) => ({
        id: hotspot.id,
        room_id: hotspot.room_id,
        x: hotspot.x,
        y: hotspot.y,
        target_room_id: hotspot.target_room_id,
        label: hotspot.label,
        label_en: hotspot.label_en,
        type: hotspot.type as 'navigation' | 'info',
        info_content: hotspot.info_content,
      })),
      created_at: (data as any).created_at,
      updated_at: (data as any).updated_at,
    };
  } catch (error) {
    errorLog('Error fetching tour room', error instanceof Error ? error : new Error(String(error)), { roomId });
    return null;
  }
};

/**
 * Create a virtual tour room
 */
export const createTourRoom = async (
  roomData: Omit<VirtualTourRoom, 'id' | 'created_at' | 'updated_at'>
): Promise<VirtualTourRoom | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('virtual_tour_rooms')
      .insert({
        property_id: roomData.property_id,
        name: roomData.name,
        name_en: roomData.name_en,
        panorama_url: roomData.panorama_url,
        thumbnail_url: roomData.thumbnail_url,
        order_index: roomData.order_index || 0,
      } as any)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        warnLog('Virtual tour rooms table not found in Supabase.');
        return null;
      }
      throw error;
    }

    // Create hotspots if provided
    if (roomData.hotspots && roomData.hotspots.length > 0) {
      await supabase
        .from('virtual_tour_hotspots')
        .insert(
          roomData.hotspots.map((hotspot) => ({
            room_id: (data as any).id,
            x: hotspot.x,
            y: hotspot.y,
            target_room_id: hotspot.target_room_id,
            label: hotspot.label,
            label_en: hotspot.label_en,
            type: hotspot.type,
            info_content: hotspot.info_content,
          })) as any
        );
    }

    return getTourRoomById((data as any).id);
  } catch (error) {
    errorLog('Error creating tour room', error instanceof Error ? error : new Error(String(error)), { roomData });
    return null;
  }
};

/**
 * Update a virtual tour room
 */
export const updateTourRoom = async (
  roomId: string,
  updates: Partial<Omit<VirtualTourRoom, 'id' | 'created_at' | 'updated_at'>>
): Promise<VirtualTourRoom | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await (supabase
      .from('virtual_tour_rooms') as any)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        return null;
      }
      throw error;
    }

    return getTourRoomById(roomId);
  } catch (error) {
    errorLog('Error updating tour room', error instanceof Error ? error : new Error(String(error)), { roomId, updates });
    return null;
  }
};

/**
 * Delete a virtual tour room
 */
export const deleteTourRoom = async (roomId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    // Delete hotspots first (cascade should handle this, but being explicit)
    await supabase
      .from('virtual_tour_hotspots')
      .delete()
      .eq('room_id', roomId);

    const { error } = await supabase
      .from('virtual_tour_rooms')
      .delete()
      .eq('id', roomId);

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        return false;
      }
      throw error;
    }

    return true;
  } catch (error) {
    errorLog('Error deleting tour room', error instanceof Error ? error : new Error(String(error)), { roomId });
    return false;
  }
};

export default {
  getPropertyTourRooms,
  getTourRoomById,
  createTourRoom,
  updateTourRoom,
  deleteTourRoom,
};

