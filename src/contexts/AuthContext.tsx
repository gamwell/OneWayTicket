import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

export type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "superadmin" | "admin" | "administrateur" | "client" | "user" | "utilisateur";
  is_admin: boolean;
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

const profileCache = new Map<string, { data: UserProfile | null; timestamp: number }>();
const CACHE_DURATION = 60000; // ✅ 1 minute de cache (au lieu de 30s)

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null, profile: null, loading: true, error: null,
  });

  const fetchProfile = useCallback(async (userId: string, force = false): Promise<UserProfile | null> => {
    if (!userId) return null;

    if (!force) {
      const cached = profileCache.get(userId);
      if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.data;
      }
    }

    // ✅ Retry automatique jusqu'à 3 fois si Supabase est lent
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          if (attempt < 3) {
            await new Promise(r => setTimeout(r, attempt * 500)); // 500ms, 1s
            continue;
          }
          console.error("[Auth] Erreur profil après 3 tentatives:", error.message);
          return null;
        }

        if (data) {
          const profileData: UserProfile = {
            id: data.id,
            email: data.email,
            full_name: data.full_name || data.prenom || null,
            is_admin: data.is_admin === true || data.est_admin === true,
            role: data.role || "user",
          };
          profileCache.set(userId, { data: profileData, timestamp: Date.now() });
          return profileData;
        }

        // Nouveau client — créer le profil
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const newProfile = {
          id: userId,
          email: authUser?.email || null,
          full_name: authUser?.user_metadata?.full_name || null,
          role: "user",
          is_admin: false,
          discount_status: "none",
        };

        await supabase.from("user_profiles").insert(newProfile);

        const fallback: UserProfile = {
          id: userId,
          email: authUser?.email || null,
          full_name: authUser?.user_metadata?.full_name || null,
          is_admin: false,
          role: "user",
        };
        profileCache.set(userId, { data: fallback, timestamp: Date.now() });
        return fallback;

      } catch (err: any) {
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, attempt * 500));
        } else {
          console.error('[Auth] Erreur critique profil:', err.message);
          return null;
        }
      }
    }
    return null;
  }, []);

  const updateAuthState = useCallback(async (session: Session | null) => {
    const user = session?.user ?? null;
    let profile: UserProfile | null = null;
    if (user) profile = await fetchProfile(user.id);
    setState({ user, profile, loading: false, error: null });
  }, [fetchProfile]);

  useEffect(() => {
    let isMounted = true;

    // ✅ Timeout sécurité 8s (au lieu de 5s) pour les connexions mobiles lentes
    const timeout = setTimeout(() => {
      if (isMounted) {
        setState(prev => prev.loading ? { ...prev, loading: false } : prev);
      }
    }, 8000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (isMounted) updateAuthState(session).finally(() => clearTimeout(timeout));
      })
      .catch(err => {
        if (isMounted) setState(prev => ({ ...prev, loading: false, error: err.message }));
        clearTimeout(timeout);
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
      clearTimeout(timeout);
    };
  }, [updateAuthState]);

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
      }).catch(e => console.warn("⚠️ Email warning:", e));
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
    <AuthContext.Provider value={{ ...state, logout, signInWithGoogle, refreshProfile, signIn, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return context;
};
