import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import Cookies from 'js-cookie';
import { authAPI } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      // Validate token with backend
      authAPI.getCurrentUser()
        .then(response => {
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        })
        .catch(() => {
          Cookies.remove('token');
          localStorage.removeItem('user');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      Cookies.set('token', token, { expires: 7 });
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const response = await authAPI.register(name, email, password, phone);
      const { token, user } = response.data;
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      Cookies.set('token', token, { expires: 7 });
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    Cookies.remove('token');
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};