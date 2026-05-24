import axios from 'axios';
import { useAuthStore } from "../store/authStore";

export const apiBaseurl =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: apiBaseurl,
});

export const publicApi = axios.create({
  baseURL: apiBaseurl,
});

export const apiClient = axios.create({
  baseURL: apiBaseurl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Also attach token to the default `api` instance
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('tokens');
  if (stored) {
    try {
      const tokens = JSON.parse(stored);
      if (tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
    } catch (_) {}
  }
  return config;
});


export const forgotPassword = async (email) => {
  await apiClient.post('/auth/forgot-password', { email });
};

export const refreshToken = async () => {
  const response = await apiClient.post('/auth/refresh-token');
  return response.data;
};