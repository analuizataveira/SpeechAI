import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dtos/create-exercise.dto';
export declare class ExercisesController {
    private readonly exercisesService;
    constructor(exercisesService: ExercisesService);
    create(createExerciseDto: CreateExerciseDto): Promise<import("./dtos/exercise-response.dto").ExerciseResponseDto>;
    findAll(): Promise<import("./dtos/exercise-response.dto").ExerciseResponseDto[]>;
    findByDiffType(diffTypeId: string): Promise<import("./dtos/exercise-response.dto").ExerciseResponseDto[]>;
    findOne(id: string): Promise<import("./dtos/exercise-response.dto").ExerciseResponseDto>;
}
