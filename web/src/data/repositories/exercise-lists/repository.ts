import { EitherResponse } from '@/domain/types/http';
import { BaseRepository } from '../base';
import { ICreateExerciseListRequest, IExerciseListResponse } from './interface';

export class ExerciseListsRepository extends BaseRepository {
  constructor() {
    super('exercise-lists');
  }

  async create(
    data: ICreateExerciseListRequest,
  ): Promise<EitherResponse<IExerciseListResponse>> {
    const response = await this.httpClient.post<EitherResponse<IExerciseListResponse>>(
      `${this.path}`,
      data,
    );

    return response.data;
  }

  async findAll(): Promise<EitherResponse<IExerciseListResponse[]>> {
    const response = await this.httpClient.get<EitherResponse<IExerciseListResponse[]>>(
      `${this.path}`,
    );

    return response.data;
  }

  async findMyLists(): Promise<EitherResponse<IExerciseListResponse[]>> {
    const response = await this.httpClient.get<EitherResponse<IExerciseListResponse[]>>(
      `${this.path}/my-lists`,
    );

    return response.data;
  }

  async findOne(id: string): Promise<EitherResponse<IExerciseListResponse>> {
    const response = await this.httpClient.get<EitherResponse<IExerciseListResponse>>(
      `${this.path}/${id}`,
    );

    return response.data;
  }
}

