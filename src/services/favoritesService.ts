// Niumba - Favorites Service
// Service pour gérer les favoris avec dossiers, notes et comparaison
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Property } from '../types';

export interface FavoriteList {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  propertyIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface PropertyNote {
  propertyId: string;
  note: string;
  createdAt: number;
  updatedAt: number;
}

export interface PriceAlert {
  propertyId: string;
  originalPrice: number;
  alertType: 'decrease' | 'increase' | 'any';
  threshold?: number; // Pourcentage de changement
  enabled: boolean;
  createdAt: number;
}

const FAVORITE_LISTS_KEY = '@niumba_favorite_lists';
const PROPERTY_NOTES_KEY = '@niumba_property_notes';
const PRICE_ALERTS_KEY = '@niumba_price_alerts';

// ============================================
// FAVORITE LISTS (Dossiers)
// ============================================

/**
 * Créer une nouvelle liste de favoris
 */
export const createFavoriteList = async (
  name: string,
  color?: string,
  icon?: string
): Promise<FavoriteList> => {
  try {
    const lists = await getFavoriteLists();
    const newList: FavoriteList = {
      id: `list_${Date.now()}_${Math.random()}`,
      name,
      color: color || '#006AFF',
      icon: icon || 'folder',
      propertyIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    lists.push(newList);
    await AsyncStorage.setItem(FAVORITE_LISTS_KEY, JSON.stringify(lists));
    return newList;
  } catch (error) {
    console.error('Error creating favorite list:', error);
    throw error;
  }
};

/**
 * Récupérer toutes les listes de favoris
 */
export const getFavoriteLists = async (): Promise<FavoriteList[]> => {
  try {
    const listsJson = await AsyncStorage.getItem(FAVORITE_LISTS_KEY);
    if (!listsJson) return [];
    return JSON.parse(listsJson) as FavoriteList[];
  } catch (error) {
    console.error('Error getting favorite lists:', error);
    return [];
  }
};

/**
 * Mettre à jour une liste de favoris
 */
export const updateFavoriteList = async (
  listId: string,
  updates: Partial<FavoriteList>
): Promise<void> => {
  try {
    const lists = await getFavoriteLists();
    const index = lists.findIndex(list => list.id === listId);
    if (index === -1) throw new Error('List not found');

    lists[index] = {
      ...lists[index],
      ...updates,
      updatedAt: Date.now(),
    };

    await AsyncStorage.setItem(FAVORITE_LISTS_KEY, JSON.stringify(lists));
  } catch (error) {
    console.error('Error updating favorite list:', error);
    throw error;
  }
};

/**
 * Supprimer une liste de favoris
 */
export const deleteFavoriteList = async (listId: string): Promise<void> => {
  try {
    const lists = await getFavoriteLists();
    const filtered = lists.filter(list => list.id !== listId);
    await AsyncStorage.setItem(FAVORITE_LISTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting favorite list:', error);
    throw error;
  }
};

/**
 * Ajouter une propriété à une liste
 */
export const addPropertyToList = async (
  listId: string,
  propertyId: string
): Promise<void> => {
  try {
    const lists = await getFavoriteLists();
    const list = lists.find(l => l.id === listId);
    if (!list) throw new Error('List not found');

    if (!list.propertyIds.includes(propertyId)) {
      list.propertyIds.push(propertyId);
      list.updatedAt = Date.now();
      await AsyncStorage.setItem(FAVORITE_LISTS_KEY, JSON.stringify(lists));
    }
  } catch (error) {
    console.error('Error adding property to list:', error);
    throw error;
  }
};

/**
 * Retirer une propriété d'une liste
 */
export const removePropertyFromList = async (
  listId: string,
  propertyId: string
): Promise<void> => {
  try {
    const lists = await getFavoriteLists();
    const list = lists.find(l => l.id === listId);
    if (!list) throw new Error('List not found');

    list.propertyIds = list.propertyIds.filter(id => id !== propertyId);
    list.updatedAt = Date.now();
    await AsyncStorage.setItem(FAVORITE_LISTS_KEY, JSON.stringify(lists));
  } catch (error) {
    console.error('Error removing property from list:', error);
    throw error;
  }
};

/**
 * Obtenir les propriétés d'une liste
 */
export const getListProperties = async (
  listId: string,
  allProperties: Property[]
): Promise<Property[]> => {
  try {
    const lists = await getFavoriteLists();
    const list = lists.find(l => l.id === listId);
    if (!list) return [];

    return allProperties.filter(p => list.propertyIds.includes(p.id));
  } catch (error) {
    console.error('Error getting list properties:', error);
    return [];
  }
};

// ============================================
// PROPERTY NOTES
// ============================================

/**
 * Sauvegarder une note sur une propriété
 */
export const savePropertyNote = async (
  propertyId: string,
  note: string
): Promise<void> => {
  try {
    const notes = await getPropertyNotes();
    const existingIndex = notes.findIndex(n => n.propertyId === propertyId);

    const noteData: PropertyNote = {
      propertyId,
      note,
      createdAt: existingIndex >= 0 ? notes[existingIndex].createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    if (existingIndex >= 0) {
      notes[existingIndex] = noteData;
    } else {
      notes.push(noteData);
    }

    await AsyncStorage.setItem(PROPERTY_NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving property note:', error);
    throw error;
  }
};

/**
 * Récupérer la note d'une propriété
 */
export const getPropertyNote = async (propertyId: string): Promise<string | null> => {
  try {
    const notes = await getPropertyNotes();
    const note = notes.find(n => n.propertyId === propertyId);
    return note?.note || null;
  } catch (error) {
    console.error('Error getting property note:', error);
    return null;
  }
};

/**
 * Récupérer toutes les notes
 */
export const getPropertyNotes = async (): Promise<PropertyNote[]> => {
  try {
    const notesJson = await AsyncStorage.getItem(PROPERTY_NOTES_KEY);
    if (!notesJson) return [];
    return JSON.parse(notesJson) as PropertyNote[];
  } catch (error) {
    console.error('Error getting property notes:', error);
    return [];
  }
};

/**
 * Supprimer la note d'une propriété
 */
export const deletePropertyNote = async (propertyId: string): Promise<void> => {
  try {
    const notes = await getPropertyNotes();
    const filtered = notes.filter(n => n.propertyId !== propertyId);
    await AsyncStorage.setItem(PROPERTY_NOTES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting property note:', error);
    throw error;
  }
};

// ============================================
// PRICE ALERTS
// ============================================

/**
 * Créer une alerte de prix
 */
export const createPriceAlert = async (
  propertyId: string,
  originalPrice: number,
  alertType: 'decrease' | 'increase' | 'any' = 'decrease',
  threshold?: number
): Promise<PriceAlert> => {
  try {
    const alerts = await getPriceAlerts();
    const newAlert: PriceAlert = {
      propertyId,
      originalPrice,
      alertType,
      threshold: threshold || 5, // 5% par défaut
      enabled: true,
      createdAt: Date.now(),
    };

    // Supprimer l'ancienne alerte si elle existe
    const filtered = alerts.filter(a => a.propertyId !== propertyId);
    filtered.push(newAlert);

    await AsyncStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(filtered));
    return newAlert;
  } catch (error) {
    console.error('Error creating price alert:', error);
    throw error;
  }
};

/**
 * Récupérer toutes les alertes de prix
 */
export const getPriceAlerts = async (): Promise<PriceAlert[]> => {
  try {
    const alertsJson = await AsyncStorage.getItem(PRICE_ALERTS_KEY);
    if (!alertsJson) return [];
    return JSON.parse(alertsJson) as PriceAlert[];
  } catch (error) {
    console.error('Error getting price alerts:', error);
    return [];
  }
};

/**
 * Vérifier si une propriété a une alerte de prix
 */
export const getPropertyPriceAlert = async (propertyId: string): Promise<PriceAlert | null> => {
  try {
    const alerts = await getPriceAlerts();
    return alerts.find(a => a.propertyId === propertyId && a.enabled) || null;
  } catch (error) {
    console.error('Error getting property price alert:', error);
    return null;
  }
};

/**
 * Vérifier les changements de prix et retourner les alertes déclenchées
 */
export const checkPriceChanges = async (
  properties: Property[]
): Promise<Array<{ property: Property; alert: PriceAlert; change: number; changePercent: number }>> => {
  try {
    const alerts = await getPriceAlerts();
    const triggered: Array<{ property: Property; alert: PriceAlert; change: number; changePercent: number }> = [];

    for (const alert of alerts) {
      if (!alert.enabled) continue;

      const property = properties.find(p => p.id === alert.propertyId);
      if (!property) continue;

      const change = property.price - alert.originalPrice;
      const changePercent = (change / alert.originalPrice) * 100;

      let shouldAlert = false;

      switch (alert.alertType) {
        case 'decrease':
          shouldAlert = change < 0 && Math.abs(changePercent) >= (alert.threshold || 5);
          break;
        case 'increase':
          shouldAlert = change > 0 && changePercent >= (alert.threshold || 5);
          break;
        case 'any':
          shouldAlert = Math.abs(changePercent) >= (alert.threshold || 5);
          break;
      }

      if (shouldAlert) {
        triggered.push({ property, alert, change, changePercent });
      }
    }

    return triggered;
  } catch (error) {
    console.error('Error checking price changes:', error);
    return [];
  }
};

/**
 * Désactiver une alerte de prix
 */
export const disablePriceAlert = async (propertyId: string): Promise<void> => {
  try {
    const alerts = await getPriceAlerts();
    const alert = alerts.find(a => a.propertyId === propertyId);
    if (alert) {
      alert.enabled = false;
      await AsyncStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(alerts));
    }
  } catch (error) {
    console.error('Error disabling price alert:', error);
    throw error;
  }
};

/**
 * Supprimer une alerte de prix
 */
export const deletePriceAlert = async (propertyId: string): Promise<void> => {
  try {
    const alerts = await getPriceAlerts();
    const filtered = alerts.filter(a => a.propertyId !== propertyId);
    await AsyncStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting price alert:', error);
    throw error;
  }
};

export default {
  // Lists
  createFavoriteList,
  getFavoriteLists,
  updateFavoriteList,
  deleteFavoriteList,
  addPropertyToList,
  removePropertyFromList,
  getListProperties,
  // Notes
  savePropertyNote,
  getPropertyNote,
  getPropertyNotes,
  deletePropertyNote,
  // Price Alerts
  createPriceAlert,
  getPriceAlerts,
  getPropertyPriceAlert,
  checkPriceChanges,
  disablePriceAlert,
  deletePriceAlert,
};


