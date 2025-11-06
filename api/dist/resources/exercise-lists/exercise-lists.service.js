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
exports.ExerciseListsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_provider_1 = require("../../providers/database/prisma.provider");
let ExerciseListsService = class ExerciseListsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(doctorId, createExerciseListDto) {
        const { exerciseIds, diffTypeId, title, difficultyLevel } = createExerciseListDto;
        const diffType = await this.prisma.diffType.findUnique({
            where: { id: diffTypeId },
        });
        if (!diffType) {
            throw new common_1.NotFoundException('Difficulty type not found');
        }
        const exercises = await this.prisma.exercise.findMany({
            where: { id: { in: exerciseIds } },
        });
        if (exercises.length !== exerciseIds.length) {
            throw new common_1.NotFoundException('One or more exercises not found');
        }
        const exerciseList = await this.prisma.exerciseList.create({
            data: {
                doctorId,
                diffTypeId,
                title,
                difficultyLevel,
                items: {
                    create: exerciseIds.map((exerciseId, index) => ({
                        exerciseId,
                        order: index,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        exercise: true,
                    },
                },
                diffType: true,
            },
        });
        return exerciseList;
    }
    async findAll() {
        return this.prisma.exerciseList.findMany({
            include: {
                items: {
                    include: {
                        exercise: true,
                    },
                },
                diffType: true,
                doctor: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByDoctor(doctorId) {
        return this.prisma.exerciseList.findMany({
            where: { doctorId },
            include: {
                items: {
                    include: {
                        exercise: true,
                    },
                },
                diffType: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const exerciseList = await this.prisma.exerciseList.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        exercise: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
                diffType: true,
                doctor: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!exerciseList) {
            throw new common_1.NotFoundException('Exercise list not found');
        }
        return exerciseList;
    }
};
exports.ExerciseListsService = ExerciseListsService;
exports.ExerciseListsService = ExerciseListsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_provider_1.PrismaService])
], ExerciseListsService);
//# sourceMappingURL=exercise-lists.service.js.map