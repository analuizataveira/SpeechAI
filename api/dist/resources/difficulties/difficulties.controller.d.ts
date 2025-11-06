import { DifficultiesService } from './difficulties.service';
import { CreateDifficultyDto } from './dtos/create-difficulty.dto';
import { RequestWithUser } from '../../config/types';
import { PrismaService } from '../../providers/database/prisma.provider';
export declare class DifficultiesController {
    private readonly difficultiesService;
    private readonly prisma;
    constructor(difficultiesService: DifficultiesService, prisma: PrismaService);
    create(createDifficultyDto: CreateDifficultyDto): Promise<import("./dtos/difficulty-response.dto").DifficultyResponseDto>;
    findMyDifficulties(req: RequestWithUser): Promise<import("./dtos/difficulty-response.dto").DifficultyResponseDto[]>;
    findByPatient(patientId: string): Promise<import("./dtos/difficulty-response.dto").DifficultyResponseDto[]>;
    remove(patientId: string, diffTypeId: string): Promise<void>;
}
