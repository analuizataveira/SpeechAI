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
exports.DoctorPatientsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const doctor_patients_service_1 = require("./doctor-patients.service");
const link_patient_dto_1 = require("./dtos/link-patient.dto");
const jwt_auth_guard_1 = require("../../framework/guards/jwt-auth.guard");
const roles_guard_1 = require("../../framework/guards/roles.guard");
const roles_decorator_1 = require("../../framework/decorators/roles.decorator");
const prisma_provider_1 = require("../../providers/database/prisma.provider");
let DoctorPatientsController = class DoctorPatientsController {
    constructor(doctorPatientsService, prisma) {
        this.doctorPatientsService = doctorPatientsService;
        this.prisma = prisma;
    }
    async linkPatient(req, linkPatientDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                doctorProfile: true,
                patientProfile: true,
            },
        });
        if (!user?.doctorProfile) {
            throw new common_1.UnauthorizedException('User is not a doctor');
        }
        return this.doctorPatientsService.linkPatient(user.doctorProfile.id, linkPatientDto);
    }
    async unlinkPatient(req, patientId) {
        const user = await this.prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                doctorProfile: true,
                patientProfile: true,
            },
        });
        if (!user?.doctorProfile) {
            throw new common_1.UnauthorizedException('User is not a doctor');
        }
        await this.doctorPatientsService.unlinkPatient(user.doctorProfile.id, patientId);
    }
    async getMyPatients(req) {
        const user = await this.prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                doctorProfile: true,
                patientProfile: true,
            },
        });
        if (!user?.doctorProfile) {
            throw new common_1.UnauthorizedException('User is not a doctor');
        }
        return this.doctorPatientsService.getMyPatients(user.doctorProfile.id);
    }
    async getMyDoctors(req) {
        const user = await this.prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                doctorProfile: true,
                patientProfile: true,
            },
        });
        if (!user?.patientProfile) {
            throw new common_1.UnauthorizedException('User is not a patient');
        }
        return this.doctorPatientsService.getAllDoctorsOfPatient(user.patientProfile.id);
    }
};
exports.DoctorPatientsController = DoctorPatientsController;
__decorate([
    (0, common_1.Post)('link'),
    (0, roles_decorator_1.Roles)('DOCTOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Link a patient to the doctor' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, link_patient_dto_1.LinkPatientDto]),
    __metadata("design:returntype", Promise)
], DoctorPatientsController.prototype, "linkPatient", null);
__decorate([
    (0, common_1.Delete)('unlink/:patientId'),
    (0, roles_decorator_1.Roles)('DOCTOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Unlink a patient from the doctor' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DoctorPatientsController.prototype, "unlinkPatient", null);
__decorate([
    (0, common_1.Get)('my-patients'),
    (0, roles_decorator_1.Roles)('DOCTOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all patients linked to the doctor' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DoctorPatientsController.prototype, "getMyPatients", null);
__decorate([
    (0, common_1.Get)('my-doctors'),
    (0, roles_decorator_1.Roles)('PATIENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all doctors linked to the patient' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DoctorPatientsController.prototype, "getMyDoctors", null);
exports.DoctorPatientsController = DoctorPatientsController = __decorate([
    (0, swagger_1.ApiTags)('Doctor Patients'),
    (0, common_1.Controller)('doctor-patients'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [doctor_patients_service_1.DoctorPatientsService,
        prisma_provider_1.PrismaService])
], DoctorPatientsController);
//# sourceMappingURL=doctor-patients.controller.js.map