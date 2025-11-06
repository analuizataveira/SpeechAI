import { CreateDifficultyDto } from '../dtos/create-difficulty.dto';
import { DifficultyResponseDto } from '../dtos/difficulty-response.dto';
export interface IDifficultiesService {
    create(createDifficultyDto: CreateDifficultyDto): Promise<DifficultyResponseDto>;
    findByPatient(patientId: string): Promise<DifficultyResponseDto[]>;
    remove(patientId: string, diffTypeId: string): Promise<void>;
}
