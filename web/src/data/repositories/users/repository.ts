import { EitherResponse } from '@/domain/types/http';
import { BaseRepository } from '../base/repository';
import { ICreateUserRequest, IUser } from './interface';

export class UsersRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  async createUser(data: ICreateUserRequest): Promise<EitherResponse<IUser>> {
    const response = await this.httpClient.post<EitherResponse<IUser>>(`${this.path}`, data);

    return response.data;
  }
}
