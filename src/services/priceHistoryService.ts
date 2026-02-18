// Niumba - Price History Service
// Service pour gérer l'historique des prix des propriétés
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { errorLog } from '../utils/logHelper';

export interface PriceHistoryEntry {
  id: string;
  property_id: string;
  price: number;
  currency: string;
  event_type: 'listed' | 'price_change' | 'price_reduced' | 'sale' | 'rented' | 'other';
  event_description?: string;
  created_at: string;
  created_by?: string;
}

/**
 * Get price history for a property
 */
export const getPriceHistory = async (
  propertyId: string,
  limit: number = 50
): Promise<PriceHistoryEntry[]> => {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Si la table n'existe pas (code 42P01), retourner un tableau vide
    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log('[getPriceHistory] price_history table does not exist, returning empty array');
        return [];
      }
      throw error;
    }
    return (data || []) as PriceHistoryEntry[];
  } catch (error) {
    // Si c'est une erreur de table inexistante, ne pas logger comme erreur
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('does not exist') || errorMessage.includes('42P01')) {
      console.log('[getPriceHistory] price_history table not found, returning empty array');
      return [];
    }
    errorLog('Error fetching price history', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
};

/**
 * Add a price history entry manually
 */
export const addPriceHistoryEntry = async (
  propertyId: string,
  price: number,
  currency: string = 'XOF',
  eventType: PriceHistoryEntry['event_type'] = 'price_change',
  eventDescription?: string
): Promise<PriceHistoryEntry | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('price_history')
      .insert({
        property_id: propertyId,
        price,
        currency,
        event_type: eventType,
        event_description: eventDescription,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data as PriceHistoryEntry;
  } catch (error) {
    errorLog('Error adding price history entry', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
};

/**
 * Get price statistics for a property
 */
export const getPriceStatistics = async (propertyId: string): Promise<{
  currentPrice: number;
  originalPrice: number;
  highestPrice: number;
  lowestPrice: number;
  priceChange: number;
  priceChangePercent: number;
  totalChanges: number;
} | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    // Get all price history entries
    const history = await getPriceHistory(propertyId, 1000);

    // Si pas d'historique, retourner null (pas une erreur)
    if (history.length === 0) return null;

    // Get current property price
    const { data: property } = await supabase
      .from('properties')
      .select('price')
      .eq('id', propertyId)
      .single();

    const currentPrice = property?.price || history[0].price;
    const originalPrice = history[history.length - 1].price;
    const prices = history.map(h => h.price);
    const highestPrice = Math.max(...prices);
    const lowestPrice = Math.min(...prices);
    const priceChange = currentPrice - originalPrice;
    const priceChangePercent = originalPrice > 0 
      ? ((priceChange / originalPrice) * 100) 
      : 0;
    const totalChanges = history.length;

    return {
      currentPrice,
      originalPrice,
      highestPrice,
      lowestPrice,
      priceChange,
      priceChangePercent,
      totalChanges,
    };
  } catch (error) {
    errorLog('Error getting price statistics', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
};

/**
 * Get price history grouped by period
 */
export const getPriceHistoryByPeriod = async (
  propertyId: string,
  period: 'month' | 'year' | 'all' = 'all'
): Promise<PriceHistoryEntry[]> => {
  if (!isSupabaseConfigured()) return [];

  try {
    let cutoffDate: Date;
    const now = new Date();

    switch (period) {
      case 'month':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'year':
        cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        cutoffDate = new Date(0); // All time
    }

    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('property_id', propertyId)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });

    // Si la table n'existe pas (code 42P01), retourner un tableau vide
    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log('[getPriceHistoryByPeriod] price_history table does not exist, returning empty array');
        return [];
      }
      throw error;
    }
    return (data || []) as PriceHistoryEntry[];
  } catch (error) {
    // Si c'est une erreur de table inexistante, ne pas logger comme erreur
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('does not exist') || errorMessage.includes('42P01')) {
      console.log('[getPriceHistoryByPeriod] price_history table not found, returning empty array');
      return [];
    }
    errorLog('Error fetching price history by period', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
};

export default {
  getPriceHistory,
  addPriceHistoryEntry,
  getPriceStatistics,
  getPriceHistoryByPeriod,
};

