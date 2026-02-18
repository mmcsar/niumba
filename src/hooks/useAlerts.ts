// Niumba - useAlerts Hook
// Hook pour gérer les alertes de recherche
import { useState, useEffect, useCallback } from 'react';
import { getAlerts, createAlert, updateAlert, deleteAlert, checkAlertMatches, getAlertMatches, markAlertAsNotified, PropertyAlert, AlertCriteria } from '../services/alertService';
import { useAuth } from '../context/AuthContext';
import { errorLog } from '../utils/logHelper';

export const useAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<PropertyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAlerts = useCallback(async () => {
    if (!user?.id) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getAlerts(user.id);
      setAlerts(data);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      errorLog('Error loading alerts', errorObj);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const addAlert = useCallback(async (
    name: string,
    criteria: AlertCriteria
  ): Promise<PropertyAlert | null> => {
    if (!user?.id) return null;

    try {
      const newAlert = await createAlert(user.id, name, criteria);
      if (newAlert) {
        setAlerts(prev => [newAlert, ...prev]);
      }
      return newAlert;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      errorLog('Error creating alert', errorObj);
      return null;
    }
  }, [user?.id]);

  const updateAlertStatus = useCallback(async (
    alertId: string,
    updates: Partial<PropertyAlert>
  ): Promise<boolean> => {
    try {
      const updated = await updateAlert(alertId, updates);
      if (updated) {
        setAlerts(prev => prev.map(a => a.id === alertId ? updated : a));
      }
      return !!updated;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      errorLog('Error updating alert', errorObj);
      return false;
    }
  }, []);

  const removeAlert = useCallback(async (alertId: string): Promise<boolean> => {
    try {
      const success = await deleteAlert(alertId);
      if (success) {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
      }
      return success;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      errorLog('Error deleting alert', errorObj);
      return false;
    }
  }, []);

  const checkMatches = useCallback(async (alertId: string): Promise<number> => {
    try {
      return await checkAlertMatches(alertId);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      errorLog('Error checking alert matches', errorObj);
      return 0;
    }
  }, []);

  const getMatches = useCallback(async (alertId: string) => {
    try {
      return await getAlertMatches(alertId);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      errorLog('Error getting alert matches', errorObj);
      return [];
    }
  }, []);

  const markAsNotified = useCallback(async (alertId: string): Promise<boolean> => {
    try {
      const success = await markAlertAsNotified(alertId);
      if (success) {
        await loadAlerts(); // Reload to update match_count
      }
      return success;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      errorLog('Error marking alert as notified', errorObj);
      return false;
    }
  }, [loadAlerts]);

  return {
    alerts,
    loading,
    error,
    loadAlerts,
    addAlert,
    updateAlertStatus,
    removeAlert,
    checkMatches,
    getMatches,
    markAsNotified,
  };
};

