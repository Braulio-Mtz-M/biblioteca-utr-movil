import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const APP_TOKEN = process.env.EXPO_PUBLIC_API_APP_TOKEN;

let onUnauthorizedCallback = null;
export const setUnauthorizedHandler = (cb) => {
  onUnauthorizedCallback = cb;
};

export async function apiFetch(endpoint, options = {}) {
  const userToken = await SecureStore.getItemAsync('user_jwt_token');

  const headers = {
    'Content-Type': 'application/json',
    'x-api-token': APP_TOKEN,
    ...options.headers,
  };

  if (userToken) {
    headers['Authorization'] = `Bearer ${userToken}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    await SecureStore.deleteItemAsync('user_jwt_token');
    await SecureStore.deleteItemAsync('user_data');
    if (onUnauthorizedCallback) onUnauthorizedCallback();
    throw new Error('Sesión expirada o no autorizada.');
  }

  if (response.status === 403) {
    Alert.alert('Acceso Restringido', 'No tienes permisos suficientes para esta sección.');
    throw new Error('Acceso prohibido (403).');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Error HTTP ${response.status}`);
  }

  return data;
}