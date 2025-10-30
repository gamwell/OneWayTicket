import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../lib/auth';
import type { User } from '../types/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentUser()
      .then(setUser)
      .catch(console.error)
      .finally(() => setLoading(false));

    const { data: { subscription } } = authService.onAuthStateChange(setUser);

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await authService.signIn({ email, password });
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const signUp = async (data: any) => {
    await authService.signUp(data);
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const signInWithGoogle = async () => {
    await authService.signInWithGoogle();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
