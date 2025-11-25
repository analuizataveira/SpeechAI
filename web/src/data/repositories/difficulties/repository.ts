import { EitherResponse } from '@/domain/types/http';
import { BaseRepository } from '../base';
import { ICreateDifficultyRequest, IDifficultyResponse } from './interface';

export class DifficultiesRepository extends BaseRepository {
  constructor() {
    super('difficulties');
  }

  async create(
    data: ICreateDifficultyRequest,
  ): Promise<EitherResponse<IDifficultyResponse>> {
    const response = await this.httpClient.post<EitherResponse<IDifficultyResponse>>(
      `${this.path}`,
      data,
    );

    return response.data;
  }

  async findMyDifficulties(): Promise<EitherResponse<IDifficultyResponse[]>> {
    const response = await this.httpClient.get<EitherResponse<IDifficultyResponse[]>>(
      `${this.path}/my-difficulties`,
    );

    return response.data;
  }

  async findByPatient(patientId: string): Promise<EitherResponse<IDifficultyResponse[]>> {
    const response = await this.httpClient.get<EitherResponse<IDifficultyResponse[]>>(
      `${this.path}/patient/${patientId}`,
    );

    return response.data;
  }

  async remove(patientId: string, diffTypeId: string): Promise<EitherResponse<void>> {
    const response = await this.httpClient.delete<EitherResponse<void>>(
      `${this.path}/${patientId}/${diffTypeId}`,
    );

    return response.data;
  }
}

