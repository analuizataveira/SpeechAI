import { AxiosInstance } from 'axios';
import { httpClient } from './httpClient';
import { LOCAL_STORAGE_KEYS, LocalStorageKey } from '../../../domain/constants/local-storage';
import { IResponseError } from '../../../domain/types/http';
import { exceptions } from '../../../domain/constants/exceptions';

// Flag to ensure response interceptor is only added once
let responseInterceptorAdded = false;

export class BaseRepository {
  path: string;
  protected httpClient: AxiosInstance;

  constructor(path: string) {
    this.path = path;
    this.httpClient = httpClient;

    // Request interceptor is now configured in httpClient.ts
    // to avoid adding it multiple times

    // Response interceptor - check if already configured to avoid duplicates
    if (!responseInterceptorAdded) {
      responseInterceptorAdded = true;
      httpClient.interceptors.response.use(
        response => {
          // If response is a blob (for PDF downloads, etc.), return it directly without transformation
          if (
            response.config?.responseType === 'blob' ||
            response.data instanceof Blob ||
            response.data instanceof ArrayBuffer
          ) {
            return response;
          }

          // For JSON responses, apply the standard transformation
          return {
            success: true,
            data: {
              success: !response.data?.errKey,
              ...(response.data || response),
            },
            headers: response.headers,
            status: response.status,
            statusText: response.statusText,
            config: response.config,
          };
        },
        (error): IResponseError => {
          console.error(
            '[BaseService] [interceptors.response] Error interceptor',
            error.response?.data,
          );

          // Handle 401 Unauthorized - try to refresh token
          if (error.response?.status === 401) {
            const refreshToken = this.loadFromLocalStorage<string>(LOCAL_STORAGE_KEYS.refreshToken);

            if (!refreshToken) {
              console.error(`Error on refresh token: No refresh token found`);
              return { success: false, ...exceptions.auth.invalidToken };
            }

            this.httpClient
              .post(`auth/refresh`, { refreshToken })
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .then((response): any => {
                if (!response.data.success) {
                  console.warn(`Error on refresh token: ${response.data}`);
                  this.removeFromLocalStorage(LOCAL_STORAGE_KEYS.accessToken);
                  this.removeFromLocalStorage(LOCAL_STORAGE_KEYS.refreshToken);
                  this.removeFromLocalStorage(LOCAL_STORAGE_KEYS.userStore);
                  window.location.href = '/';
                  return { success: false, ...exceptions.auth.invalidToken };
                }

                if (response.data?.accessToken && response.data?.refreshToken) {
                  this.saveToLocalStorage(
                    LOCAL_STORAGE_KEYS.accessToken,
                    response.data?.accessToken,
                  );
                  this.saveToLocalStorage(
                    LOCAL_STORAGE_KEYS.refreshToken,
                    response.data?.refreshToken,
                  );
                  window.location.reload();
                  return this.httpClient.request(error.config);
                }
              })
              .catch(() => {
                console.error(`Catch: Error on refresh token: ${error.response?.data?.message}`);
                this.removeFromLocalStorage(LOCAL_STORAGE_KEYS.accessToken);
                this.removeFromLocalStorage(LOCAL_STORAGE_KEYS.refreshToken);

                return { success: false, ...exceptions.auth.invalidToken };
              });
          }

          // Handle cases where there's no response at all
          if (!error.response || !error.response.data) {
            console.error('No response data in error');
            return {
              success: false,
              errKey: 'networkError',
              message: error.message || 'Network error',
              friendlyMessage: 'Erro de conexão. Verifique sua internet e tente novamente.',
            };
          }

          const errorData = error.response.data;

          // Handle NestJS standard HTTP exceptions (404, 400, etc.)
          // These have: { message, error, statusCode } but no errKey
          if (errorData.message && errorData.statusCode && !errorData.errKey) {
            return {
              success: false,
              errKey: `http_${error.response.status}`,
              message: errorData.message || `HTTP ${error.response.status}`,
              friendlyMessage: errorData.message || 'Erro na requisição',
            };
          }

          // Handle custom errors with errKey
          if (errorData.errKey) {
            return {
              success: false,
              errKey: errorData.errKey,
              message: errorData.message,
              friendlyMessage: errorData.friendlyMessage,
            };
          }

          // Fallback for unknown error structure
          console.error('Unknown error response on http client interceptor', errorData);
          return {
            success: false,
            errKey: 'unknownError',
            message: errorData.message || exceptions.misc.internal.message,
            friendlyMessage: errorData.message || exceptions.misc.internal.friendlyMessage,
          };
        },
      );
    }
  }

  healthCheck() {
    return this.httpClient.get<{ status: boolean }>(`${this.path}/health`);
  }

  loadFromLocalStorage<T>(key: LocalStorageKey): T | null {
    const value = localStorage.getItem(key);
    if (!value) return null;
    try {
      if (typeof value === 'object') {
        return JSON.parse(value) as T;
      }

      return value as unknown as T;
    } catch (e: unknown) {
      console.error(`Error on loadFromLocalStorage: ${e}`);
      return value as unknown as T;
    }
  }

  saveToLocalStorage<T>(key: LocalStorageKey, value: T) {
    if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value));
      return;
    }

    localStorage.setItem(key, value as unknown as string);
  }

  removeFromLocalStorage(key: LocalStorageKey) {
    localStorage.removeItem(key);
  }
}
