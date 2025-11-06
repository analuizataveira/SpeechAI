"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiffTypesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_provider_1 = require("../../providers/database/prisma.provider");
let DiffTypesService = class DiffTypesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDiffTypeDto) {
        const diffType = await this.prisma.diffType.create({
            data: createDiffTypeDto,
        });
        return diffType;
    }
    async findAll() {
        return this.prisma.diffType.findMany({
            orderBy: { description: 'asc' },
        });
    }
    async findOne(id) {
        const diffType = await this.prisma.diffType.findUnique({
            where: { id },
        });
        if (!diffType) {
            throw new common_1.NotFoundException('Difficulty type not found');
        }
        return diffType;
    }
    async update(id, updateDiffTypeDto) {
        const diffType = await this.prisma.diffType.findUnique({
            where: { id },
        });
        if (!diffType) {
            throw new common_1.NotFoundException('Difficulty type not found');
        }
        return this.prisma.diffType.update({
            where: { id },
            data: updateDiffTypeDto,
        });
    }
    async remove(id) {
        const diffType = await this.prisma.diffType.findUnique({
            where: { id },
        });
        if (!diffType) {
            throw new common_1.NotFoundException('Difficulty type not found');
        }
        await this.prisma.diffType.delete({
            where: { id },
        });
    }
};
exports.DiffTypesService = DiffTypesService;
exports.DiffTypesService = DiffTypesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_provider_1.PrismaService])
], DiffTypesService);
//# sourceMappingURL=diff-types.service.js.map