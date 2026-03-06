import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

// --- TYPES ---
export type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "superadmin" | "admin" | "administrateur" | "client" | "user" | "utilisateur";
  is_admin: boolean; // Colonne principale utilisée par l'app
};

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signIn: (e: string, p: string) => Promise<{ error: AuthError | null }>;
  signUp: (e: string, p: string, n: string) => Promise<{ error: AuthError | null }>;
}

// --- CACHE ---
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
      if (!supabase) throw new Error("Supabase client non disponible");

      // ✅ Correction : Utilisation du nom technique "user_profiles" 
      // car "profils d'utilisateurs" n'est pas reconnu par le moteur SQL
      const { data, error } = await supabase
        .from("user_profiles")
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("[Auth] Erreur lors de la récupération du profil:", error.message);
        return null;
      }

      if (data) {
        // ✅ Correction : Mapping basé sur votre JSON réel (is_admin et role sans accents)
        const profileData: UserProfile = {
          id: data.id,
          email: data.email,
          full_name: data.full_name || data.prenom || null,
          is_admin: data.is_admin === true || data.est_admin === true,
          role: data.role || data.rôle || "user",
        };

        console.log("[Auth] Profil normalisé avec succès:", profileData);
        profileCache.set(userId, { data: profileData, timestamp: Date.now() });
        return profileData;
      }

      return null;
    } catch (err: any) {
      console.error('[Auth] Erreur critique profil:', err.message);
      return null;
    }
  }, []);

  const updateAuthState = useCallback(async (session: Session | null) => {
    const user = session?.user ?? null;
    let profile: UserProfile | null = null;
    
    if (user) {
      profile = await fetchProfile(user.id);
    }
    
    setState({ user, profile, loading: false, error: null });
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

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (!error && data?.user) {
      supabase.functions.invoke('send-welcome-email', {
        body: { record: { email, first_name: fullName, profile_type: "standard" } }
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
      signIn,
      signUp,
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