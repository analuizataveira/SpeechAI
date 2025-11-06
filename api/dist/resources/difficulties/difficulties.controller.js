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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DifficultiesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const difficulties_service_1 = require("./difficulties.service");
const create_difficulty_dto_1 = require("./dtos/create-difficulty.dto");
const jwt_auth_guard_1 = require("../../framework/guards/jwt-auth.guard");
const roles_guard_1 = require("../../framework/guards/roles.guard");
const roles_decorator_1 = require("../../framework/decorators/roles.decorator");
const prisma_provider_1 = require("../../providers/database/prisma.provider");
const common_2 = require("@nestjs/common");
let DifficultiesController = class DifficultiesController {
    constructor(difficultiesService, prisma) {
        this.difficultiesService = difficultiesService;
        this.prisma = prisma;
    }
    create(createDifficultyDto) {
        return this.difficultiesService.create(createDifficultyDto);
    }
    async findMyDifficulties(req) {
        const user = await this.prisma.user.findUnique({
            where: { id: req.user.id },
            include: { patientProfile: true },
        });
        if (!user?.patientProfile) {
            throw new common_2.UnauthorizedException('User is not a patient');
        }
        return this.difficultiesService.findByPatient(user.patientProfile.id);
    }
    findByPatient(patientId) {
        return this.difficultiesService.findByPatient(patientId);
    }
    remove(patientId, diffTypeId) {
        return this.difficultiesService.remove(patientId, diffTypeId);
    }
};
exports.DifficultiesController = DifficultiesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('DOCTOR', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a difficulty for a patient' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_difficulty_dto_1.CreateDifficultyDto]),
    __metadata("design:returntype", void 0)
], DifficultiesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my-difficulties'),
    (0, roles_decorator_1.Roles)('PATIENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my difficulties' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DifficultiesController.prototype, "findMyDifficulties", null);
__decorate([
    (0, common_1.Get)('patient/:patientId'),
    (0, roles_decorator_1.Roles)('DOCTOR', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get difficulties for a patient' }),
    __param(0, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DifficultiesController.prototype, "findByPatient", null);
__decorate([
    (0, common_1.Delete)(':patientId/:diffTypeId'),
    (0, roles_decorator_1.Roles)('DOCTOR', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a difficulty from a patient' }),
    __param(0, (0, common_1.Param)('patientId')),
    __param(1, (0, common_1.Param)('diffTypeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DifficultiesController.prototype, "remove", null);
exports.DifficultiesController = DifficultiesController = __decorate([
    (0, swagger_1.ApiTags)('Difficulties'),
    (0, common_1.Controller)('difficulties'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [difficulties_service_1.DifficultiesService,
        prisma_provider_1.PrismaService])
], DifficultiesController);
//# sourceMappingURL=difficulties.controller.js.map