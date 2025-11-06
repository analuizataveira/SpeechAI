import { PrismaService } from '../../providers/database/prisma.provider';
import { IDifficultiesService } from './interfaces/difficulties.service.interface';
import { CreateDifficultyDto } from './dtos/create-difficulty.dto';
import { DifficultyResponseDto } from './dtos/difficulty-response.dto';
export declare class DifficultiesService implements IDifficultiesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createDifficultyDto: CreateDifficultyDto): Promise<DifficultyResponseDto>;
    findByPatient(patientId: string): Promise<DifficultyResponseDto[]>;
    remove(patientId: string, diffTypeId: string): Promise<void>;
}
