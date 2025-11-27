import { useUserStore } from '@/data/stores/user.store';
import { LOCAL_STORAGE_KEYS } from '../../../domain/constants/local-storage';
import { EitherResponse } from '../../../domain/types/http';
import { BaseRepository } from '../base/repository';
import { ILoginCredentials, ILoginResponse, ILogoutResponse, IMeResponse } from './interface';

export class AuthRepository extends BaseRepository {
  constructor() {
    super('auth');
  }

  async login(data: ILoginCredentials): Promise<EitherResponse<ILoginResponse>> {
    try {
      const response = await this.httpClient.post<EitherResponse<ILoginResponse>>(
        `${this.path}/login`,
        {
          email: data.email.replace(/[^a-zA-ZÀ-ú0-9@._]/g, ''),
          password: data.password,
        },
      );

      // Handle successful response - BaseRepository interceptor wraps in { success, data }
      const responseData = response?.data || response;
      
      if (responseData?.success !== false) {
        // Extract the actual login data from nested structure
        const innerData = (responseData as any)?.data || responseData;
        
        // Look for access_token in the response
        const accessToken = innerData?.access_token || (innerData as any)?.data?.access_token;
        
        if (accessToken) {
          this.saveToLocalStorage(LOCAL_STORAGE_KEYS.accessToken, accessToken);

          useUserStore.setState({
            accessToken: accessToken,
          });
        }
      }

      return responseData;
    } catch (error: any) {
      // Handle error response from interceptor
      console.error('Login error:', error);
      return { success: false, message: error?.message || 'Login failed' } as any;
    }
  }

  async getMe(): Promise<EitherResponse<IMeResponse>> {
    try {
      const response = await this.httpClient.get<EitherResponse<IMeResponse>>(
        `${this.path}/me`,
      );

      return response?.data || response;
    } catch (error: any) {
      console.error('GetMe error:', error);
      return { success: false, message: error?.message || 'Failed to get user info' } as any;
    }
  }

  async logout(): Promise<EitherResponse<ILogoutResponse>> {
    const response = await this.httpClient.post<EitherResponse<ILogoutResponse>>(
      `${this.path}/logout`,
    );

    // Remove tokens from localStorage
    this.removeFromLocalStorage(LOCAL_STORAGE_KEYS.accessToken);
    this.removeFromLocalStorage(LOCAL_STORAGE_KEYS.refreshToken);
    this.removeFromLocalStorage(LOCAL_STORAGE_KEYS.userStore);

    // Clear user store
    useUserStore.setState({
      accessToken: '',
    });

    return response.data;
  }
}
