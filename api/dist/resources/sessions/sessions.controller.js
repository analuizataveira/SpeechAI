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
exports.SessionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sessions_service_1 = require("./sessions.service");
const create_session_dto_1 = require("./dtos/create-session.dto");
const update_session_dto_1 = require("./dtos/update-session.dto");
const jwt_auth_guard_1 = require("../../framework/guards/jwt-auth.guard");
const roles_guard_1 = require("../../framework/guards/roles.guard");
const roles_decorator_1 = require("../../framework/decorators/roles.decorator");
const prisma_provider_1 = require("../../providers/database/prisma.provider");
const common_2 = require("@nestjs/common");
const public_decorator_1 = require("../../framework/decorators/public.decorator");
let SessionsController = class SessionsController {
    constructor(sessionsService, prisma) {
        this.sessionsService = sessionsService;
        this.prisma = prisma;
    }
    async create(req, createSessionDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: req.user.id },
            include: { patientProfile: true },
        });
        if (!user?.patientProfile) {
            throw new common_2.UnauthorizedException('User is not a patient');
        }
        return this.sessionsService.create(user.patientProfile.id, createSessionDto);
    }
    findAll() {
        return this.sessionsService.findAll();
    }
    async findMySessions(req) {
        const user = await this.prisma.user.findUnique({
            where: { id: req.user.id },
            include: { patientProfile: true },
        });
        if (!user?.patientProfile) {
            throw new common_2.UnauthorizedException('User is not a patient');
        }
        return this.sessionsService.findByPatient(user.patientProfile.id);
    }
    findByPatient(patientId) {
        return this.sessionsService.findByPatient(patientId);
    }
    findOne(id) {
        return this.sessionsService.findOne(id);
    }
    update(id, updateSessionDto) {
        return this.sessionsService.update(id, updateSessionDto);
    }
    async completeSession(id, data) {
        return this.sessionsService.completeSession(id, data);
    }
};
exports.SessionsController = SessionsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('PATIENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a session' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_session_dto_1.CreateSessionDto]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'DOCTOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all sessions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-sessions'),
    (0, roles_decorator_1.Roles)('PATIENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my sessions' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "findMySessions", null);
__decorate([
    (0, common_1.Get)('patient/:patientId'),
    (0, roles_decorator_1.Roles)('DOCTOR', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sessions for a patient' }),
    __param(0, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "findByPatient", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a session by id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('PATIENT', 'DOCTOR', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a session' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_session_dto_1.UpdateSessionDto]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('webhook/complete/:id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Webhook for n8n to complete sessions' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_session_dto_1.UpdateSessionDto]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "completeSession", null);
exports.SessionsController = SessionsController = __decorate([
    (0, swagger_1.ApiTags)('Sessions'),
    (0, common_1.Controller)('sessions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [sessions_service_1.SessionsService,
        prisma_provider_1.PrismaService])
], SessionsController);
//# sourceMappingURL=sessions.controller.js.map