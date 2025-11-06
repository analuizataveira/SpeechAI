import { CreateDiffTypeDto } from '../dtos/create-diff-type.dto';
import { UpdateDiffTypeDto } from '../dtos/update-diff-type.dto';
import { DiffTypeResponseDto } from '../dtos/diff-type-response.dto';
export interface IDiffTypesService {
    create(createDiffTypeDto: CreateDiffTypeDto): Promise<DiffTypeResponseDto>;
    findAll(): Promise<DiffTypeResponseDto[]>;
    findOne(id: string): Promise<DiffTypeResponseDto>;
    update(id: string, updateDiffTypeDto: UpdateDiffTypeDto): Promise<DiffTypeResponseDto>;
    remove(id: string): Promise<void>;
}
