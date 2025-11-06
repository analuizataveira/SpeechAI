import { PrismaService } from '../../providers/database/prisma.provider';
import { IExercisesService } from './interfaces/exercises.service.interface';
import { CreateExerciseDto } from './dtos/create-exercise.dto';
import { ExerciseResponseDto } from './dtos/exercise-response.dto';
export declare class ExercisesService implements IExercisesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createExerciseDto: CreateExerciseDto): Promise<ExerciseResponseDto>;
    findAll(): Promise<ExerciseResponseDto[]>;
    findByDiffType(diffTypeId: string): Promise<ExerciseResponseDto[]>;
    findOne(id: string): Promise<ExerciseResponseDto>;
}
