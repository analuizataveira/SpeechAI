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
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_provider_1 = require("../../providers/database/prisma.provider");
let SessionsService = class SessionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(patientId, createSessionDto) {
        const exerciseList = await this.prisma.exerciseList.findUnique({
            where: { id: createSessionDto.exerciseListId },
        });
        if (!exerciseList) {
            throw new common_1.NotFoundException('Exercise list not found');
        }
        const session = await this.prisma.session.create({
            data: {
                patientId,
                exerciseListId: createSessionDto.exerciseListId,
                startedAt: new Date(createSessionDto.startedAt),
            },
        });
        return session;
    }
    async findAll() {
        return this.prisma.session.findMany({
            include: {
                patient: {
                    include: {
                        user: true,
                    },
                },
                exerciseList: {
                    include: {
                        diffType: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByPatient(patientId) {
        return this.prisma.session.findMany({
            where: { patientId },
            include: {
                exerciseList: {
                    include: {
                        diffType: true,
                        items: {
                            include: {
                                exercise: true,
                            },
                            orderBy: {
                                order: 'asc',
                            },
                        },
                    },
                },
            },
            orderBy: { startedAt: 'desc' },
        });
    }
    async findOne(id) {
        const session = await this.prisma.session.findUnique({
            where: { id },
            include: {
                patient: {
                    include: {
                        user: true,
                    },
                },
                exerciseList: {
                    include: {
                        diffType: true,
                        items: {
                            include: {
                                exercise: true,
                            },
                            orderBy: {
                                order: 'asc',
                            },
                        },
                        doctor: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        return session;
    }
    async update(id, updateSessionDto) {
        const session = await this.prisma.session.findUnique({
            where: { id },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        if (session.finishedAt) {
            throw new common_1.ForbiddenException('Cannot modify completed sessions');
        }
        return this.prisma.session.update({
            where: { id },
            data: updateSessionDto,
        });
    }
    async completeSession(id, data) {
        const session = await this.prisma.session.findUnique({
            where: { id },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        return this.prisma.session.update({
            where: { id },
            data: {
                ...data,
                finishedAt: new Date(),
            },
        });
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_provider_1.PrismaService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map