import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

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
    loading: true,
    error: null,
  });

  // Utilisation d'une ref pour éviter de déclencher l'effet quand on vérifie l'initialisation
  const initialized = useRef(false);

  const loadProfile = useCallback(async (userId: string, forceRefresh = false) => {
    if (!forceRefresh) {
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
      return data;
    } catch (error: any) {
      console.error('[Auth] Error loading profile:', error.message);
      return null;
    }
  }, []);

  useEffect(() => {
    // Empêche la double initialisation
    if (initialized.current) return;
    initialized.current = true;

    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // 1. Obtenir la session actuelle
        const { data: { session } } = await supabase.auth.getSession();
        
        let profileData = null;
        if (session?.user) {
          profileData = await loadProfile(session.user.id);
        }

        if (isMounted) {
          setState({
            user: session?.user ?? null,
            profile: profileData,
            loading: false,
            error: null,
          });
        }
      } catch (error: any) {
        if (isMounted) {
          setState(prev => ({ ...prev, loading: false, error: error.message }));
        }
      }
    };

    // 2. Écouter les changements d'état (Une seule fois au montage)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const profileData = newSession?.user ? await loadProfile(newSession.user.id, true) : null;
          setState({
            user: newSession?.user ?? null,
            profile: profileData,
            loading: false,
            error: null,
          });
        } else if (event === 'SIGNED_OUT') {
          profileCache.clear();
          setState({ user: null, profile: null, loading: false, error: null });
        }
      }
    );

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]); // Retrait de state.loading des dépendances pour casser la boucle

  const logout = async () => {
    await supabase.auth.signOut();
    profileCache.clear();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/auth/login';
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  const refreshProfile = async () => {
    if (!state.user) return;
    const profileData = await loadProfile(state.user.id, true);
    setState(prev => ({ ...prev, profile: profileData }));
  };

  return (
    <AuthContext.Provider value={{ ...state, logout, loginWithGoogle, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};