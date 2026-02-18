// Niumba - Security Utilities
// Fonctions pour masquer les données sensibles comme le rôle admin

import { Profile } from '../types/database';

/**
 * Masque le rôle admin pour les utilisateurs non-admins
 * @param profile - Le profil à sécuriser
 * @param currentUserId - L'ID de l'utilisateur actuel
 * @param isCurrentUserAdmin - Si l'utilisateur actuel est admin
 * @returns Le profil avec le rôle masqué si nécessaire
 */
export const maskAdminRole = (
  profile: Profile | null,
  currentUserId: string | null,
  isCurrentUserAdmin: boolean
): Profile | null => {
  if (!profile) return null;

  // Si c'est le propre profil de l'utilisateur, retourner tel quel
  if (currentUserId && profile.id === currentUserId) {
    return profile;
  }

  // Si l'utilisateur actuel est admin, retourner tel quel
  if (isCurrentUserAdmin) {
    return profile;
  }

  // Sinon, masquer le rôle admin
  if (profile.role === 'admin') {
    return {
      ...profile,
      role: 'user' as const,
    };
  }

  return profile;
};

/**
 * Masque le rôle admin dans un tableau de profils
 */
export const maskAdminRoles = (
  profiles: Profile[],
  currentUserId: string | null,
  isCurrentUserAdmin: boolean
): Profile[] => {
  return profiles.map(profile => maskAdminRole(profile, currentUserId, isCurrentUserAdmin) || profile);
};

/**
 * Vérifie si un rôle peut être exposé publiquement
 */
export const canExposeRole = (
  profileRole: string,
  currentUserId: string | null,
  profileId: string,
  isCurrentUserAdmin: boolean
): boolean => {
  // Si c'est le propre profil, oui
  if (currentUserId && profileId === currentUserId) {
    return true;
  }

  // Si l'utilisateur actuel est admin, oui
  if (isCurrentUserAdmin) {
    return true;
  }

  // Si le profil n'est pas admin, oui
  if (profileRole !== 'admin') {
    return true;
  }

  // Sinon, non (masquer le rôle admin)
  return false;
};

/**
 * Sécurise un profil pour l'exposition publique
 * Retourne seulement les champs publics
 */
export const getPublicProfile = (
  profile: Profile | null,
  currentUserId: string | null,
  isCurrentUserAdmin: boolean
): Partial<Profile> | null => {
  if (!profile) return null;

  const baseProfile = {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    phone: profile.phone,
    avatar_url: profile.avatar_url,
    company_name: profile.company_name,
    company_logo: profile.company_logo,
    language: profile.language,
    city: profile.city,
    province: profile.province,
    is_verified: profile.is_verified,
    is_active: profile.is_active,
  };

  // Ajouter le rôle seulement si autorisé
  if (canExposeRole(profile.role, currentUserId, profile.id, isCurrentUserAdmin)) {
    return {
      ...baseProfile,
      role: profile.role,
    };
  } else {
    // Masquer le rôle admin
    return {
      ...baseProfile,
      role: 'user' as const,
    };
  }
};

export default {
  maskAdminRole,
  maskAdminRoles,
  canExposeRole,
  getPublicProfile,
};


