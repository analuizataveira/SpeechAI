import { CreateExerciseListDto } from '../dtos/create-exercise-list.dto';
import { ExerciseListResponseDto } from '../dtos/exercise-list-response.dto';

export interface IExerciseListsService {
  create(
    doctorId: string,
    createExerciseListDto: CreateExerciseListDto,
  ): Promise<ExerciseListResponseDto>;
  findAll(): Promise<ExerciseListResponseDto[]>;
  findByDoctor(doctorId: string): Promise<ExerciseListResponseDto[]>;
  findOne(id: string): Promise<any>;
}
