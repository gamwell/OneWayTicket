import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
// ✅ CORRECTION ICI : On remonte d'un dossier (..) pour aller dans (lib)
import { supabase } from '../lib/supabaseClient';

// --- CONFIGURATION DU CACHE ---
const profileCache = new Map<string, { data: UserProfile | null; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 secondes

// --- TYPES ---
export type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "superadmin" | "admin" | "client" | "user";
  is_admin?: boolean;
};

interface AuthState {
  user: User | null;
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
    loading: true,
    error: null,
  });

  // --- LOGIQUE DE RÉCUPÉRATION DU PROFIL ---
  const fetchProfile = useCallback(async (userId: string, force = false) => {
    if (!force) {
      const cached = profileCache.get(userId);
      if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.data;
      }
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      
      profileCache.set(userId, { data, timestamp: Date.now() });
      return data as UserProfile;
    } catch (err: any) {
      console.error('[Auth] Erreur lors de la récupération du profil:', err.message);
      return null;
    }
  }, []);

  // --- GESTION DE L'ÉTAT D'AUTHENTIFICATION ---
  useEffect(() => {
    let isMounted = true;

    const updateAuthState = async (session: Session | null) => {
      const user = session?.user ?? null;
      let profile = null;

      if (user) {
        profile = await fetchProfile(user.id);
      }

      if (isMounted) {
        setState({
          user,
          profile,
          loading: false,
          error: null,
        });
      }
    };

    // Initialisation : Récupérer la session active au lancement
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session);
    }).catch(err => {
      console.error("[Auth] Erreur session initiale:", err);
      if (isMounted) setState(prev => ({ ...prev, loading: false }));
    });

    // Écouteur en temps réel pour les changements (Login, Logout, Token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth] Événement Supabase : ${event}`);
      
      if (event === 'SIGNED_OUT') {
        profileCache.clear();
        if (isMounted) {
          setState({ user: null, profile: null, loading: false, error: null });
        }
      } else {
        // Pour SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED
        updateAuthState(session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // --- ACTIONS ---
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      profileCache.clear();
      // Redirection complète pour réinitialiser l'application proprement
      window.location.href = '/auth/login';
    } catch (err) {
      console.error("[Auth] Erreur lors de la déconnexion:", err);
    }
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/`,
        queryParams: { prompt: 'select_account' } // Force le choix du compte
      },
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

// --- HOOK ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l’intérieur d’un AuthProvider');
  }
  return context;
};