import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { setUnauthorizedHandler } from '../services/apiFetch';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const logout = async () => {
    await SecureStore.deleteItemAsync('user_jwt_token');
    await SecureStore.deleteItemAsync('user_data');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });

    const restoreSession = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync('user_jwt_token');
        const savedUser = await SecureStore.getItemAsync('user_data');
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } finally {
        setLoadingSession(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (jwtToken, userData) => {
    await SecureStore.setItemAsync('user_jwt_token', jwtToken);
    await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  const isAuthenticated = Boolean(token);
  const isAdmin = user?.rol === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{ token, user, login, logout, isAuthenticated, isAdmin, loadingSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);