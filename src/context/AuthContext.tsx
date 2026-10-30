import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '../types/index.js';
import { api, setAuthToken } from '../services/api.js';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name?: string, phone?: string) => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await api.auth.me();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.user) {
      setAuthToken(res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const res = await api.auth.register({ name, email, password, phone });
    if (res.success && res.user) {
      setAuthToken(res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (name?: string, phone?: string) => {
    const res = await api.auth.updateProfile({ name, phone });
    if (res.success && res.user) {
      setUser(res.user);
    }
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
