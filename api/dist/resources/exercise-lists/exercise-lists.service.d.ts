import { PrismaService } from '../../providers/database/prisma.provider';
import { IExerciseListsService } from './interfaces/exercise-lists.service.interface';
import { CreateExerciseListDto } from './dtos/create-exercise-list.dto';
import { ExerciseListResponseDto } from './dtos/exercise-list-response.dto';
export declare class ExerciseListsService implements IExerciseListsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(doctorId: string, createExerciseListDto: CreateExerciseListDto): Promise<ExerciseListResponseDto>;
    findAll(): Promise<ExerciseListResponseDto[]>;
    findByDoctor(doctorId: string): Promise<ExerciseListResponseDto[]>;
    findOne(id: string): Promise<any>;
}
