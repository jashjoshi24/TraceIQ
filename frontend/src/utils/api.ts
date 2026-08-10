import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Dynamically match browser hostname (localhost vs 127.0.0.1) to avoid browser cross-origin blocks
const getDynamicBaseURL = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:8001`;
  }
  return 'http://127.0.0.1:8001';
};

export let API_BASE_URL = getDynamicBaseURL();

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enables sending/receiving HttpOnly cookies (refresh_token)
  timeout: 15000, // Fail fast instead of leaving the UI stuck on a spinner forever
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token from Zustand store
api.interceptors.request.use(
  (config) => {
    // Ensure baseURL matches active API_BASE_URL
    config.baseURL = API_BASE_URL;
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Silent Token Refresh on 401 & Port Auto-Fallback
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle Network Connection Errors (Try fallback port 8000 or switch localhost/127.0.0.1)
    if (!error.response || error.code === 'ERR_NETWORK') {
      if (!originalRequest._portTried) {
        originalRequest._portTried = true;
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
        API_BASE_URL = `http://${currentHost}:8000`;
        api.defaults.baseURL = API_BASE_URL;
        originalRequest.baseURL = API_BASE_URL;
        return api(originalRequest);
      }
    }
    
    // Check if error is 401, request hasn't been retried yet, and isn't auth/login or auth/refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        // Attempt silent refresh using HttpOnly cookie
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data.access_token;
        useAuthStore.getState().setAccessToken(newAccessToken);

        // Update Authorization header for retry
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token invalid or expired: clear auth state
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
