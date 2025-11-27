import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { LOCAL_STORAGE_KEYS } from '../../../domain/constants/local-storage';

export const httpClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 17000,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.accessToken);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      ('[httpClient] Authorization header set');
    } else {
      console.warn('[httpClient] No token found in localStorage');
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);
