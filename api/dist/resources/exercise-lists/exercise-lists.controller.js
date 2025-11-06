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
exports.ExerciseListsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const exercise_lists_service_1 = require("./exercise-lists.service");
const create_exercise_list_dto_1 = require("./dtos/create-exercise-list.dto");
const jwt_auth_guard_1 = require("../../framework/guards/jwt-auth.guard");
const roles_guard_1 = require("../../framework/guards/roles.guard");
const roles_decorator_1 = require("../../framework/decorators/roles.decorator");
const prisma_provider_1 = require("../../providers/database/prisma.provider");
const common_2 = require("@nestjs/common");
let ExerciseListsController = class ExerciseListsController {
    constructor(exerciseListsService, prisma) {
        this.exerciseListsService = exerciseListsService;
        this.prisma = prisma;
    }
    async create(req, createExerciseListDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: req.user.id },
            include: { doctorProfile: true },
        });
        if (!user?.doctorProfile) {
            throw new common_2.UnauthorizedException('User is not a doctor');
        }
        return this.exerciseListsService.create(user.doctorProfile.id, createExerciseListDto);
    }
    findAll() {
        return this.exerciseListsService.findAll();
    }
    async findMyLists(req) {
        const user = await this.prisma.user.findUnique({
            where: { id: req.user.id },
            include: { doctorProfile: true },
        });
        if (!user?.doctorProfile) {
            throw new common_2.UnauthorizedException('User is not a doctor');
        }
        return this.exerciseListsService.findByDoctor(user.doctorProfile.id);
    }
    findOne(id) {
        return this.exerciseListsService.findOne(id);
    }
};
exports.ExerciseListsController = ExerciseListsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('DOCTOR', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Create an exercise list' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_exercise_list_dto_1.CreateExerciseListDto]),
    __metadata("design:returntype", Promise)
], ExerciseListsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all exercise lists' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExerciseListsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-lists'),
    (0, roles_decorator_1.Roles)('DOCTOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my exercise lists' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExerciseListsController.prototype, "findMyLists", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get an exercise list by id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExerciseListsController.prototype, "findOne", null);
exports.ExerciseListsController = ExerciseListsController = __decorate([
    (0, swagger_1.ApiTags)('Exercise Lists'),
    (0, common_1.Controller)('exercise-lists'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [exercise_lists_service_1.ExerciseListsService,
        prisma_provider_1.PrismaService])
], ExerciseListsController);
//# sourceMappingURL=exercise-lists.controller.js.map