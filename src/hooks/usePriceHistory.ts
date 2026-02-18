// Niumba - usePriceHistory Hook
// Hook pour gérer l'historique des prix
import { useState, useEffect, useCallback } from 'react';
import { getPriceHistory, getPriceStatistics, getPriceHistoryByPeriod, PriceHistoryEntry } from '../services/priceHistoryService';
import { errorLog } from '../utils/logHelper';

export const usePriceHistory = (propertyId: string | null) => {
  const [history, setHistory] = useState<PriceHistoryEntry[]>([]);
  const [statistics, setStatistics] = useState<{
    currentPrice: number;
    originalPrice: number;
    highestPrice: number;
    lowestPrice: number;
    priceChange: number;
    priceChangePercent: number;
    totalChanges: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadHistory = useCallback(async (period?: 'month' | 'year' | 'all') => {
    if (!propertyId) {
      setHistory([]);
      setStatistics(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = period 
        ? await getPriceHistoryByPeriod(propertyId, period)
        : await getPriceHistory(propertyId);
      setHistory(data || []);

      // Load statistics (peut retourner null si pas d'historique, ce n'est pas une erreur)
      const stats = await getPriceStatistics(propertyId);
      setStatistics(stats);
    } catch (err) {
      // Ne pas traiter l'absence de table comme une erreur fatale
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('does not exist') || errorMessage.includes('42P01')) {
        // Table n'existe pas, ce n'est pas une erreur, juste une fonctionnalité non disponible
        setHistory([]);
        setStatistics(null);
        setError(null);
      } else {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        errorLog('Error loading price history', errorObj);
      }
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    statistics,
    loading,
    error,
    loadHistory,
  };
};

