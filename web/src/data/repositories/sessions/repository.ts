import { EitherResponse } from '@/domain/types/http';
import { BaseRepository } from '../base';
import { ICreateSessionRequest, ISessionResponse, IUpdateSessionRequest } from './interface';

export class SessionsRepository extends BaseRepository {
  constructor() {
    super('sessions');
  }

  async create(data: ICreateSessionRequest): Promise<EitherResponse<ISessionResponse>> {
    const response = await this.httpClient.post<EitherResponse<ISessionResponse>>(
      `${this.path}`,
      data,
    );

    return response.data;
  }

  async findAll(): Promise<EitherResponse<ISessionResponse[]>> {
    const response = await this.httpClient.get<EitherResponse<ISessionResponse[]>>(`${this.path}`);

    return response.data;
  }

  async findMySessions(): Promise<EitherResponse<ISessionResponse[]>> {
    const response = await this.httpClient.get<EitherResponse<ISessionResponse[]>>(
      `${this.path}/my-sessions`,
    );

    return response.data;
  }

  async findByPatient(patientId: string): Promise<EitherResponse<ISessionResponse[]>> {
    const response = await this.httpClient.get<EitherResponse<ISessionResponse[]>>(
      `${this.path}/patient/${patientId}`,
    );

    return response.data;
  }

  async findOne(id: string): Promise<EitherResponse<ISessionResponse>> {
    const response = await this.httpClient.get<EitherResponse<ISessionResponse>>(
      `${this.path}/${id}`,
    );

    return response.data;
  }

  async update(id: string, data: IUpdateSessionRequest): Promise<EitherResponse<ISessionResponse>> {
    const response = await this.httpClient.patch<EitherResponse<ISessionResponse>>(
      `${this.path}/${id}`,
      data,
    );

    return response.data;
  }

  async completeSession(
    id: string,
    data: IUpdateSessionRequest,
  ): Promise<EitherResponse<ISessionResponse>> {
    const response = await this.httpClient.post<EitherResponse<ISessionResponse>>(
      `${this.path}/webhook/complete/${id}`,
      data,
    );

    return response.data;
  }
}
