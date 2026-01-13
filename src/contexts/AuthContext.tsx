import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';

// ✅ CORRECTION : On utilise le fichier centralisé 'supabase' et non 'supabaseClient'
import { supabase } from '../lib/supabase'; 

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

// --- CONFIGURATION DU CACHE ---
const profileCache = new Map<string, { data: UserProfile | null; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 secondes

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  // --- RÉCUPÉRATION DU PROFIL ---
  const fetchProfile = useCallback(async (userId: string, force = false): Promise<UserProfile | null> => {
    if (!userId) return null;

    if (!force) {
      const cached = profileCache.get(userId);
      if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.data;
      }
    }

    try {
      // ✅ Vérification si supabase est bien initialisé
      if (!supabase) throw new Error("Supabase client non disponible");

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn("[Auth] Problème profil:", error.message);
      }
      
      const profileData = data as UserProfile;
      profileCache.set(userId, { data: profileData, timestamp: Date.now() });
      return profileData;
    } catch (err: any) {
      console.error('[Auth] Erreur critique profil:', err.message);
      return null;
    }
  }, []);

  // --- MISE À JOUR DE L'ÉTAT ---
  const updateAuthState = useCallback(async (session: Session | null) => {
    const user = session?.user ?? null;
    let profile: UserProfile | null = null;

    if (user) {
      profile = await fetchProfile(user.id);
    }

    setState({
      user,
      profile,
      loading: false,
      error: null,
    });
  }, [fetchProfile]);

  // --- GESTION DE LA SESSION ---
  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      setState(prev => ({ ...prev, loading: false, error: "Client Supabase manquant" }));
      return;
    }

    // 1. Vérification session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) updateAuthState(session);
    }).catch(err => {
      if (isMounted) setState(prev => ({ ...prev, loading: false, error: err.message }));
    });

    // 2. Écouteur en temps réel
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        profileCache.clear();
        if (isMounted) setState({ user: null, profile: null, loading: false, error: null });
      } else if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
        if (isMounted) updateAuthState(session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [updateAuthState]);

  // --- ACTIONS ---
  const logout = async () => {
    try {
      if (supabase) await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      profileCache.clear();
      window.location.assign('/auth/login');
    } catch (err) {
      console.error("[Auth] Erreur logout:", err);
    }
  };

  const loginWithGoogle = async () => {
    if (!supabase) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${origin}/auth/callback`, // ✅ Correction : pointe vers callback
        queryParams: { access_type: 'offline', prompt: 'consent' }
      },
    });
  };

  const refreshProfile = async () => {
    if (state.user) {
      const profile = await fetchProfile(state.user.id, true);
      setState(prev => ({ ...prev, profile }));
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
  if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return context;
};