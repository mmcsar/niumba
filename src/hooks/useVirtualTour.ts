// Niumba - Virtual Tour Hook
// React hook for managing virtual tour rooms

import { useState, useEffect, useCallback } from 'react';
import {
  getPropertyTourRooms,
  getTourRoomById,
  type VirtualTourRoom,
} from '../services/virtualTourService';

/**
 * Hook to fetch virtual tour rooms for a property
 */
export const usePropertyVirtualTour = (propertyId: string | null) => {
  const [rooms, setRooms] = useState<VirtualTourRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    if (!propertyId) {
      setRooms([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getPropertyTourRooms(propertyId);
      setRooms(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(errorMessage);
      console.error('Error loading virtual tour rooms:', err);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const refresh = useCallback(() => {
    loadRooms();
  }, [loadRooms]);

  return {
    rooms,
    loading,
    error,
    refresh,
  };
};

/**
 * Hook to fetch a single tour room
 */
export const useTourRoom = (roomId: string | null) => {
  const [room, setRoom] = useState<VirtualTourRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRoom = useCallback(async () => {
    if (!roomId) {
      setRoom(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getTourRoomById(roomId);
      setRoom(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(errorMessage);
      console.error('Error loading tour room:', err);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  const refresh = useCallback(() => {
    loadRoom();
  }, [loadRoom]);

  return {
    room,
    loading,
    error,
    refresh,
  };
};

export default usePropertyVirtualTour;


