import axios from 'axios';

export const apiBaseurl =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: apiBaseurl,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const publicApi = axios.create({ baseURL: apiBaseurl });

// Attach access token from localStorage on every request
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

// Auto-refresh access token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const stored = localStorage.getItem('tokens');
        const tokens = stored ? JSON.parse(stored) : null;
        if (!tokens?.refreshToken) throw new Error('No refresh token');

        const { data } = await publicApi.post('/auth/refresh-token', {
          refreshToken: tokens.refreshToken,
        });

        const newTokens = { ...tokens, accessToken: data.data.accessToken };
        localStorage.setItem('tokens', JSON.stringify(newTokens));
        original.headers.Authorization = `Bearer data.data.accessToken`;
        return api(original);
      } catch (_) {
        localStorage.removeItem('user');
        localStorage.removeItem('tokens');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const forgotPassword = async (email) => {
  await publicApi.post('/auth/forgot-password', { email });
};
