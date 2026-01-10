import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Cache simple pour éviter les appels inutiles
const profileCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000;

type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "superadmin" | "admin" | "client" | "user";
  is_admin?: boolean;
};

interface AuthState {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true, // État initial : chargement
    error: null,
  });

  // Fonction pour charger le profil utilisateur
  const fetchProfile = useCallback(async (userId: string, force = false) => {
    if (!force) {
      const cached = profileCache.get(userId);
      if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) return cached.data;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      profileCache.set(userId, { data, timestamp: Date.now() });
      return data;
    } catch (err: any) {
      console.error('[Auth] Erreur profil:', err.message);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. Définir la fonction de mise à jour globale
    const updateAuthState = async (session: any) => {
      let profileData = null;
      if (session?.user) {
        profileData = await fetchProfile(session.user.id);
      }

      if (isMounted) {
        setState({
          user: session?.user ?? null,
          profile: profileData,
          loading: false, // ICI : On libère l'écran de chargement
          error: null,
        });
      }
    };

    // 2. Initialisation : Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session);
    }).catch(err => {
      console.error("[Auth] Erreur session initiale:", err);
      if (isMounted) setState(prev => ({ ...prev, loading: false }));
    });

    // 3. Écouter les changements (Login, Logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth] Événement : ${event}`);
      
      if (event === 'SIGNED_OUT') {
        profileCache.clear();
        if (isMounted) setState({ user: null, profile: null, loading: false, error: null });
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        updateAuthState(session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      profileCache.clear();
      // Redirection brutale pour nettoyer tous les états React
      window.location.href = '/auth/login';
    } catch (err) {
      console.error("Erreur déconnexion:", err);
    }
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  const refreshProfile = async () => {
    if (state.user) {
      const data = await fetchProfile(state.user.id, true);
      setState(prev => ({ ...prev, profile: data }));
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, logout, loginWithGoogle, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return context;
};