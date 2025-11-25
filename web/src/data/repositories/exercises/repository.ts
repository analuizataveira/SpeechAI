import { EitherResponse } from '@/domain/types/http';
import { BaseRepository } from '../base';
import { ICreateExerciseRequest, IExerciseResponse } from './interface';

export class ExercisesRepository extends BaseRepository {
  constructor() {
    super('exercises');
  }

  async create(data: ICreateExerciseRequest): Promise<EitherResponse<IExerciseResponse>> {
    const response = await this.httpClient.post<EitherResponse<IExerciseResponse>>(
      `${this.path}`,
      data,
    );

    return response.data;
  }

  async findAll(): Promise<EitherResponse<IExerciseResponse[]>> {
    const response = await this.httpClient.get<EitherResponse<IExerciseResponse[]>>(`${this.path}`);

    return response.data;
  }

  async findByDiffType(diffTypeId: string): Promise<EitherResponse<IExerciseResponse[]>> {
    const response = await this.httpClient.get<EitherResponse<IExerciseResponse[]>>(
      `${this.path}/diff-type/${diffTypeId}`,
    );

    return response.data;
  }

  async findOne(id: string): Promise<EitherResponse<IExerciseResponse>> {
    const response = await this.httpClient.get<EitherResponse<IExerciseResponse>>(
      `${this.path}/${id}`,
    );

    return response.data;
  }
}

