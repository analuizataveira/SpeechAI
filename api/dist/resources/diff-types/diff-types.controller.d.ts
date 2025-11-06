import { DiffTypesService } from './diff-types.service';
import { CreateDiffTypeDto } from './dtos/create-diff-type.dto';
import { UpdateDiffTypeDto } from './dtos/update-diff-type.dto';
export declare class DiffTypesController {
    private readonly diffTypesService;
    constructor(diffTypesService: DiffTypesService);
    create(createDiffTypeDto: CreateDiffTypeDto): Promise<import("./dtos/diff-type-response.dto").DiffTypeResponseDto>;
    findAll(): Promise<import("./dtos/diff-type-response.dto").DiffTypeResponseDto[]>;
    findOne(id: string): Promise<import("./dtos/diff-type-response.dto").DiffTypeResponseDto>;
    update(id: string, updateDiffTypeDto: UpdateDiffTypeDto): Promise<import("./dtos/diff-type-response.dto").DiffTypeResponseDto>;
    remove(id: string): Promise<void>;
}
