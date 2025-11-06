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
exports.DifficultiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_provider_1 = require("../../providers/database/prisma.provider");
let DifficultiesService = class DifficultiesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDifficultyDto) {
        const patient = await this.prisma.patientProfile.findUnique({
            where: { id: createDifficultyDto.patientId },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        const diffType = await this.prisma.diffType.findUnique({
            where: { id: createDifficultyDto.diffTypeId },
        });
        if (!diffType) {
            throw new common_1.NotFoundException('Difficulty type not found');
        }
        const existing = await this.prisma.difficulty.findUnique({
            where: {
                patientId_diffTypeId: {
                    patientId: createDifficultyDto.patientId,
                    diffTypeId: createDifficultyDto.diffTypeId,
                },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Patient already has this difficulty');
        }
        return this.prisma.difficulty.create({
            data: createDifficultyDto,
        });
    }
    async findByPatient(patientId) {
        return this.prisma.difficulty.findMany({
            where: { patientId },
            include: {
                diffType: true,
            },
        });
    }
    async remove(patientId, diffTypeId) {
        const difficulty = await this.prisma.difficulty.findUnique({
            where: {
                patientId_diffTypeId: {
                    patientId,
                    diffTypeId,
                },
            },
        });
        if (!difficulty) {
            throw new common_1.NotFoundException('Difficulty not found');
        }
        await this.prisma.difficulty.delete({
            where: { id: difficulty.id },
        });
    }
};
exports.DifficultiesService = DifficultiesService;
exports.DifficultiesService = DifficultiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_provider_1.PrismaService])
], DifficultiesService);
//# sourceMappingURL=difficulties.service.js.map