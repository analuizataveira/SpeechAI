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
exports.ExercisesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_provider_1 = require("../../providers/database/prisma.provider");
let ExercisesService = class ExercisesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createExerciseDto) {
        const diffType = await this.prisma.diffType.findUnique({
            where: { id: createExerciseDto.diffTypeId },
        });
        if (!diffType) {
            throw new common_1.NotFoundException('Difficulty type not found');
        }
        return this.prisma.exercise.create({
            data: createExerciseDto,
        });
    }
    async findAll() {
        return await this.prisma.exercise.findMany({
            include: {
                diffType: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByDiffType(diffTypeId) {
        const diffType = await this.prisma.diffType.findUnique({
            where: { id: diffTypeId },
        });
        if (!diffType) {
            throw new common_1.NotFoundException('Difficulty type not found');
        }
        return this.prisma.exercise.findMany({
            where: { diffTypeId },
            include: {
                diffType: true,
            },
        });
    }
    async findOne(id) {
        const exercise = await this.prisma.exercise.findUnique({
            where: { id },
            include: { diffType: true },
        });
        if (!exercise) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        return exercise;
    }
};
exports.ExercisesService = ExercisesService;
exports.ExercisesService = ExercisesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_provider_1.PrismaService])
], ExercisesService);
//# sourceMappingURL=exercises.service.js.map