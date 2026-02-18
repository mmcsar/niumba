// Niumba - Authentication Context
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, UserRole } from '../types/database';
import { trackUserRegistration, isHubSpotConfigured } from '../services/hubspotService';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isOwner: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isConfigured = isSupabaseConfigured();

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    if (!isConfigured) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Si le profil n'existe pas (PGRST116), essayer de le créer
        if (error.code === 'PGRST116' || error.message?.includes('0 rows')) {
          console.warn('Profile not found, attempting to create it...');
          
          // Récupérer les infos de l'utilisateur depuis auth.users
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData?.user) {
            // Créer le profil manuellement
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userData.user.id,
                email: userData.user.email || '',
                full_name: userData.user.user_metadata?.full_name || userData.user.email || 'User',
                role: 'user',
                is_verified: !!userData.user.email_confirmed_at,
                is_active: true,
                language: userData.user.user_metadata?.language || 'fr',
              } as any);

            if (!createError) {
              // Recharger le profil après création
              const { data: newProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
              
              if (newProfile) {
                setProfile(newProfile);
                return;
              }
            }
          }
        }
        
        // Si on arrive ici, il y a une vraie erreur
        console.error('Error fetching profile:', error);
        setProfile(null);
        return;
      }

      if (data) {
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  // Initialize auth state
  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [isConfigured]);

  // Sign in with email
  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      return { error: new Error('Supabase non configuré') };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign up with email
  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isConfigured) {
      return { error: new Error('Supabase non configuré') };
    }

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      // Si l'inscription réussit, créer le profil si le trigger ne l'a pas fait
      if (!error && authData.user) {
        try {
          // Attendre un peu pour que le trigger s'exécute
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Vérifier si le profil existe
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', authData.user.id)
            .single();

          // Si le profil n'existe pas, le créer manuellement
          if (!existingProfile) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: authData.user.id,
                email: email,
                full_name: fullName,
                role: 'user',
                is_verified: false,
                is_active: true,
                language: 'fr',
              } as any);

            if (profileError) {
              console.error('Error creating profile:', profileError);
              // Ne pas bloquer l'inscription si le profil échoue
            }
          }

          // Charger le profil après création
          await fetchProfile(authData.user.id);
        } catch (profileErr) {
          console.error('Error handling profile creation:', profileErr);
          // Ne pas bloquer l'inscription
        }

        // Track registration in HubSpot if configured
        if (isHubSpotConfigured()) {
          await trackUserRegistration({
            email,
            name: fullName,
            role: 'user',
          });
        }
      }

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    if (!isConfigured) return;
    await supabase.auth.signOut();
    setProfile(null);
  };

  // Reset password
  const resetPassword = async (email: string) => {
    if (!isConfigured) {
      return { error: new Error('Supabase non configuré') };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!isConfigured || !user) {
      return { error: new Error('Non connecté') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (!error) {
        setProfile(prev => prev ? { ...prev, ...updates } : null);
      }
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Check roles
  const isAdmin = profile?.role === 'admin';
  const isEditor = profile?.role === 'editor';
  const isOwner = profile?.role === 'owner' || profile?.role === 'agent' || profile?.role === 'admin' || profile?.role === 'editor';

  const value: AuthContextType = {
    session,
    user,
    profile,
    isLoading,
    isAdmin,
    isEditor,
    isOwner,
    isConfigured,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
