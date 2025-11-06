import { ExerciseListsService } from './exercise-lists.service';
import { CreateExerciseListDto } from './dtos/create-exercise-list.dto';
import { RequestWithUser } from '../../config/types';
import { PrismaService } from '../../providers/database/prisma.provider';
export declare class ExerciseListsController {
    private readonly exerciseListsService;
    private readonly prisma;
    constructor(exerciseListsService: ExerciseListsService, prisma: PrismaService);
    create(req: RequestWithUser, createExerciseListDto: CreateExerciseListDto): Promise<import("./dtos/exercise-list-response.dto").ExerciseListResponseDto>;
    findAll(): Promise<import("./dtos/exercise-list-response.dto").ExerciseListResponseDto[]>;
    findMyLists(req: RequestWithUser): Promise<import("./dtos/exercise-list-response.dto").ExerciseListResponseDto[]>;
    findOne(id: string): Promise<any>;
}
