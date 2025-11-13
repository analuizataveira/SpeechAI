import { EitherResponse } from '@/domain/types/http';
import { BaseRepository } from '../base';
import {
  ICreateDiffTypeRequest,
  IUpdateDiffTypeRequest,
  IDiffTypeResponse,
} from './interface';

export class DiffTypesRepository extends BaseRepository {
  constructor() {
    super('diff-types');
  }

  async create(data: ICreateDiffTypeRequest): Promise<EitherResponse<IDiffTypeResponse>> {
    const response = await this.httpClient.post<EitherResponse<IDiffTypeResponse>>(
      `${this.path}`,
      data,
    );

    return response.data;
  }

  async findAll(): Promise<EitherResponse<IDiffTypeResponse[]>> {
    const response = await this.httpClient.get<EitherResponse<IDiffTypeResponse[]>>(
      `${this.path}`,
    );

    return response.data;
  }

  async findOne(id: string): Promise<EitherResponse<IDiffTypeResponse>> {
    const response = await this.httpClient.get<EitherResponse<IDiffTypeResponse>>(
      `${this.path}/${id}`,
    );

    return response.data;
  }

  async update(
    id: string,
    data: IUpdateDiffTypeRequest,
  ): Promise<EitherResponse<IDiffTypeResponse>> {
    const response = await this.httpClient.patch<EitherResponse<IDiffTypeResponse>>(
      `${this.path}/${id}`,
      data,
    );

    return response.data;
  }

  async remove(id: string): Promise<EitherResponse<void>> {
    const response = await this.httpClient.delete<EitherResponse<void>>(
      `${this.path}/${id}`,
    );

    return response.data;
  }
}

