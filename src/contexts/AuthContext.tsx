import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';

// ✅ CORRECTION 1 : Le bon chemin vers votre fichier client
import { supabase } from '../supabaseClient';

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

// ✅ CORRECTION 2 : Ajout des signatures pour signIn et signUp
interface AuthContextType extends AuthState {
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>; // Renommé pour standardiser
  refreshProfile: () => Promise<void>;
  signIn: (e: string, p: string) => Promise<{ error: AuthError | null }>;
  signUp: (e: string, p: string, n: string) => Promise<{ error: AuthError | null }>;
}

// --- CONFIGURATION DU CACHE ---
const profileCache = new Map<string, { data: UserProfile | null; timestamp: number }>();
const CACHE_DURATION = 30000;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  // --- RÉCUPÉRATION DU PROFIL (Votre logique conservée) ---
  const fetchProfile = useCallback(async (userId: string, force = false): Promise<UserProfile | null> => {
    if (!userId) return null;

    if (!force) {
      const cached = profileCache.get(userId);
      if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.data;
      }
    }

    try {
      if (!supabase) throw new Error("Supabase client non disponible");

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) console.warn("[Auth] Problème profil:", error.message);

      const profileData = data as UserProfile;
      if (profileData) {
        profileCache.set(userId, { data: profileData, timestamp: Date.now() });
      }
      return profileData;
    } catch (err: any) {
      console.error('[Auth] Erreur critique profil:', err.message);
      return null;
    }
  }, []);

  const updateAuthState = useCallback(async (session: Session | null) => {
    const user = session?.user ?? null;
    let profile: UserProfile | null = null;

    if (user) profile = await fetchProfile(user.id);

    setState({
      user,
      profile,
      loading: false,
      error: null,
    });
  }, [fetchProfile]);

  // --- GESTION SESSION ---
  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      setState(prev => ({ ...prev, loading: false, error: "Client Supabase manquant" }));
      return;
    }

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (isMounted) updateAuthState(session);
      })
      .catch(err => {
        if (isMounted) setState(prev => ({ ...prev, loading: false, error: err.message }));
      });

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

  // --- ACTIONS (CORRIGÉES ET COMPLÉTÉES) ---

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

  // ✅ Renommé en signInWithGoogle pour matcher votre frontend
  const signInWithGoogle = async () => {
    if (!supabase) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' }
      },
    });
  };

  // ✅ AJOUT : Fonction SignIn (Email/Password)
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  // ✅ AJOUT : Fonction SignUp (Email/Password + Edge Function)
  const signUp = async (email: string, password: string, fullName: string) => {
    // 1. Inscription
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    // 2. Trigger Edge Function (Email de bienvenue)
    if (!error && data?.user) {
      supabase.functions.invoke('send-welcome-email', {
        body: {
          record: {
            email: email,
            first_name: fullName,
            profile_type: "standard"
          }
        }
      }).then(({ error: funcError }) => {
        if (funcError) console.warn("⚠️ Email warning:", funcError);
      });
    }

    return { error };
  };

  const refreshProfile = async () => {
    if (state.user) {
      const profile = await fetchProfile(state.user.id, true);
      setState(prev => ({ ...prev, profile }));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      logout, 
      signInWithGoogle, 
      refreshProfile,
      signIn, // ✅ Exporté
      signUp  // ✅ Exporté
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return context;
};