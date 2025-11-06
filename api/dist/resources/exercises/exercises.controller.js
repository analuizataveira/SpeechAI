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
exports.ExercisesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const exercises_service_1 = require("./exercises.service");
const create_exercise_dto_1 = require("./dtos/create-exercise.dto");
const jwt_auth_guard_1 = require("../../framework/guards/jwt-auth.guard");
const roles_guard_1 = require("../../framework/guards/roles.guard");
const roles_decorator_1 = require("../../framework/decorators/roles.decorator");
let ExercisesController = class ExercisesController {
    constructor(exercisesService) {
        this.exercisesService = exercisesService;
    }
    create(createExerciseDto) {
        return this.exercisesService.create(createExerciseDto);
    }
    findAll() {
        return this.exercisesService.findAll();
    }
    findByDiffType(diffTypeId) {
        return this.exercisesService.findByDiffType(diffTypeId);
    }
    findOne(id) {
        return this.exercisesService.findOne(id);
    }
};
exports.ExercisesController = ExercisesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('DOCTOR', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Create an exercise' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_exercise_dto_1.CreateExerciseDto]),
    __metadata("design:returntype", void 0)
], ExercisesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all exercises' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExercisesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('diff-type/:diffTypeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get exercises by difficulty type' }),
    __param(0, (0, common_1.Param)('diffTypeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExercisesController.prototype, "findByDiffType", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get an exercise by id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExercisesController.prototype, "findOne", null);
exports.ExercisesController = ExercisesController = __decorate([
    (0, swagger_1.ApiTags)('Exercises'),
    (0, common_1.Controller)('exercises'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [exercises_service_1.ExercisesService])
], ExercisesController);
//# sourceMappingURL=exercises.controller.js.map