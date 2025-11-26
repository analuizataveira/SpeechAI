import { GenerateExercisesResponseDto } from '../dtos/generate-exercises.dto';
import { ExerciseListResponseDto } from '../../exercise-lists/dtos/exercise-list-response.dto';

export interface IAiExercisesService {
  generateExercises(
    patientId: string,
    userId: string,
  ): Promise<GenerateExercisesResponseDto>;
  generateExercisesAndCreateList(
    patientId: string,
    userId: string,
  ): Promise<ExerciseListResponseDto>;
}

