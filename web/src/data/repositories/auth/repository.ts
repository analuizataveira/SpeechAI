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
    const response = await this.httpClient.post<EitherResponse<ILoginResponse>>(
      `${this.path}/login`,
      {
        email: data.email.replace(/[^a-zA-ZÀ-ú0-9@._]/g, ''),
        password: data.password,
      },
    );

    if (response.data?.success) {
      const loginData = response.data as ILoginResponse & { success: true };
      this.saveToLocalStorage(LOCAL_STORAGE_KEYS.accessToken, loginData.access_token);

      useUserStore.setState({
        accessToken: loginData.access_token,
      });
    }

    return response.data;
  }

  async getMe(): Promise<EitherResponse<IMeResponse>> {
    const response = await this.httpClient.get<EitherResponse<IMeResponse>>(
      `${this.path}/me`,
    );

    return response.data;
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
