import { EitherResponse } from '@/domain/types/http';
import { BaseRepository } from '../base';
import { IGenerateExercisesRequest, IGenerateExercisesResponse } from './interface';
import { IExerciseListResponse } from '../exercise-lists/interface';

export class AiExercisesRepository extends BaseRepository {
  constructor() {
    super('ai-exercises');
  }

  async generateExercises(
    data?: IGenerateExercisesRequest,
  ): Promise<EitherResponse<IGenerateExercisesResponse>> {
    const response = await this.httpClient.post<EitherResponse<IGenerateExercisesResponse>>(
      `${this.path}/generate`,
      data || {},
    );

    return response.data;
  }

  async generateExercisesAndCreateList(
    data?: IGenerateExercisesRequest,
  ): Promise<EitherResponse<IExerciseListResponse>> {
    const response = await this.httpClient.post<EitherResponse<IExerciseListResponse>>(
      `${this.path}/generate-and-create-list`,
      data || {},
    );

    return response.data;
  }
}

