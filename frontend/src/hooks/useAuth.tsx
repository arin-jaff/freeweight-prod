import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi, LoginRequest, SignupRequest } from '../api/endpoints';

interface User {
  id: string;
  email: string;
  name: string;
  user_type: 'athlete' | 'coach';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        const response = await authApi.me();
        setUser(response.data);
      }
    } catch (error) {
      await SecureStore.deleteItemAsync('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data);
    await SecureStore.setItemAsync('auth_token', response.data.access_token);
    setUser(response.data.user);
  };

  const signup = async (data: SignupRequest) => {
    const response = await authApi.signup(data);
    await SecureStore.setItemAsync('auth_token', response.data.access_token);
    setUser(response.data.user);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
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
