import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoading: boolean;
  login: (mobile: string, pass: string) => Promise<UserProfile>;
  register: (data: { name: string; mobile: string; password: string; address?: string; email?: string }) => Promise<UserProfile>;
  logout: () => void;
  switchDemoUser: (role: 'admin' | 'employee' | 'customer') => Promise<UserProfile | void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const saved = localStorage.getItem('csc_user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        setCurrentUser(user);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    } else {
      // Default to guest/unauthenticated so the customer portal is visible
      // but if user wants quick test, demo accounts are 1-tap accessible
    }
    setIsLoading(false);
  }, []);

  const login = async (mobile: string, pass: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await api.login(mobile, pass);
      setCurrentUser(res.user);
      localStorage.setItem('csc_user', JSON.stringify(res.user));
      localStorage.setItem('csc_token', res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; mobile: string; password: string; address?: string; email?: string }): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setCurrentUser(res.user);
      localStorage.setItem('csc_user', JSON.stringify(res.user));
      localStorage.setItem('csc_token', res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('csc_user');
    localStorage.removeItem('csc_token');
  };

  const switchDemoUser = async (role: 'admin' | 'employee' | 'customer') => {
    if (role === 'admin') {
      return await login('9289787348', 'admin123');
    } else if (role === 'employee') {
      return await login('9876543210', 'emp123');
    } else {
      return await login('9811223344', 'cust123');
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, register, logout, switchDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
