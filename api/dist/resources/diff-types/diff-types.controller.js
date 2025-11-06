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
exports.DiffTypesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const diff_types_service_1 = require("./diff-types.service");
const create_diff_type_dto_1 = require("./dtos/create-diff-type.dto");
const update_diff_type_dto_1 = require("./dtos/update-diff-type.dto");
const jwt_auth_guard_1 = require("../../framework/guards/jwt-auth.guard");
const roles_guard_1 = require("../../framework/guards/roles.guard");
const roles_decorator_1 = require("../../framework/decorators/roles.decorator");
let DiffTypesController = class DiffTypesController {
    constructor(diffTypesService) {
        this.diffTypesService = diffTypesService;
    }
    create(createDiffTypeDto) {
        return this.diffTypesService.create(createDiffTypeDto);
    }
    findAll() {
        return this.diffTypesService.findAll();
    }
    findOne(id) {
        return this.diffTypesService.findOne(id);
    }
    update(id, updateDiffTypeDto) {
        return this.diffTypesService.update(id, updateDiffTypeDto);
    }
    remove(id) {
        return this.diffTypesService.remove(id);
    }
};
exports.DiffTypesController = DiffTypesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'DOCTOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a difficulty type' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_diff_type_dto_1.CreateDiffTypeDto]),
    __metadata("design:returntype", void 0)
], DiffTypesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all difficulty types' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DiffTypesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a difficulty type by id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiffTypesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'DOCTOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a difficulty type' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_diff_type_dto_1.UpdateDiffTypeDto]),
    __metadata("design:returntype", void 0)
], DiffTypesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a difficulty type' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiffTypesController.prototype, "remove", null);
exports.DiffTypesController = DiffTypesController = __decorate([
    (0, swagger_1.ApiTags)('Diff Types'),
    (0, common_1.Controller)('diff-types'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [diff_types_service_1.DiffTypesService])
], DiffTypesController);
//# sourceMappingURL=diff-types.controller.js.map