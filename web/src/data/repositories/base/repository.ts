import {
  LOCAL_STORAGE_KEYS,
  LocalStorageKey,
} from '@/domain/constants/local-storage'
import { AxiosInstance } from 'axios'
import { httpClient } from './httpClient'
import { IResponseError } from '@/domain/types'
import { exceptions } from '@/domain/constants/exceptions'

export class BaseRepository {
  path: string
  protected httpClient: AxiosInstance

  constructor(path: string) {
    this.path = path
    this.httpClient = httpClient

    httpClient.interceptors.request.use(
      config => {
        const token = this.loadFromLocalStorage<string>(
          LOCAL_STORAGE_KEYS.accessToken,
        )
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      error => {
        return Promise.reject(error)
      },
    )

    httpClient.interceptors.response.use(
      response => ({
        success: true,
        data: {
          success: !response.data?.errKey,
          ...(response.data || response),
        },
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
        config: response.config,
      }),
      (error): IResponseError => {
        console.error(
          '[BaseService] [interceptors.response] Error interceptor',
          error.response?.data,
        )

        if (
          !error.response ||
          !error.response.data ||
          !error.response.data.errKey
        ) {
          console.error('Unknown error response on http client interceptor')
          return { success: false, ...exceptions.misc.internal }
        }

        if (error.response.status === 401) {
          const refreshToken = this.loadFromLocalStorage<string>(
            LOCAL_STORAGE_KEYS.refreshToken,
          )

          if (!refreshToken) {
            console.error(`Error on refresh token: No refresh token found`)
            return { success: false, ...exceptions.auth.invalidToken }
          }

          this.httpClient
            .post(`auth/refresh`, { refreshToken })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((response): any => {
              if (!response.data.success) {
                console.warn(`Error on refresh token: ${response.data}`)
                this.removeFromLocalStorage(LOCAL_STORAGE_KEYS.accessToken)
                this.removeFromLocalStorage(LOCAL_STORAGE_KEYS.refreshToken)
                this.removeFromLocalStorage(LOCAL_STORAGE_KEYS.userStore)
                window.location.href = '/'
                return { success: false, ...exceptions.auth.invalidToken }
              }

              if (response.data?.accessToken && response.data?.refreshToken) {
                this.saveToLocalStorage(
                  LOCAL_STORAGE_KEYS.accessToken,
                  response.data?.accessToken,
                )
                this.saveToLocalStorage(
                  LOCAL_STORAGE_KEYS.refreshToken,
                  response.data?.refreshToken,
                )
                window.location.reload()
                return this.httpClient.request(error.config)
              }
            })
            .catch(() => {
              console.error(
                `Catch: Error on refresh token: ${error.response.data.message}`,
              )
              this.removeFromLocalStorage(LOCAL_STORAGE_KEYS.accessToken)
              this.removeFromLocalStorage(LOCAL_STORAGE_KEYS.refreshToken)

              return { success: false, ...exceptions.auth.invalidToken }
            })
        }

        return {
          success: false,
          errKey: error.response.data.errKey,
          message: error.response.data.message,
          friendlyMessage: error.response.data.friendlyMessage,
        }
      },
    )
  }

  healthCheck() {
    return this.httpClient.get<{ status: boolean }>(`${this.path}/health`)
  }

  loadFromLocalStorage<T>(key: LocalStorageKey): T | null {
    const value = localStorage.getItem(key)
    if (!value) return null
    try {
      if (typeof value === 'object') {
        return JSON.parse(value) as T
      }

      return value as unknown as T
    } catch (e: unknown) {
      console.error(`Error on loadFromLocalStorage: ${e}`)
      return value as unknown as T
    }
  }

  saveToLocalStorage<T>(key: LocalStorageKey, value: T) {
    if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value))
      return
    }

    localStorage.setItem(key, value as unknown as string)
  }

  removeFromLocalStorage(key: LocalStorageKey) {
    localStorage.removeItem(key)
  }
}
