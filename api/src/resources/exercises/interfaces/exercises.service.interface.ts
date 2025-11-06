import { CreateExerciseDto } from '../dtos/create-exercise.dto';
import { ExerciseResponseDto } from '../dtos/exercise-response.dto';

export interface IExercisesService {
  create(createExerciseDto: CreateExerciseDto): Promise<ExerciseResponseDto>;
  findAll(): Promise<ExerciseResponseDto[]>;
  findByDiffType(diffTypeId: string): Promise<ExerciseResponseDto[]>;
  findOne(id: string): Promise<ExerciseResponseDto>;
}
