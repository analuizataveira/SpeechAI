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
exports.DoctorPatientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_provider_1 = require("../../providers/database/prisma.provider");
let DoctorPatientsService = class DoctorPatientsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async linkPatient(doctorId, linkPatientDto) {
        const { patientId } = linkPatientDto;
        const doctorProfile = await this.prisma.doctorProfile.findUnique({
            where: { id: doctorId },
        });
        if (!doctorProfile) {
            throw new common_1.NotFoundException('Doctor profile not found');
        }
        const patientProfile = await this.prisma.patientProfile.findUnique({
            where: { id: patientId },
        });
        if (!patientProfile) {
            throw new common_1.NotFoundException('Patient profile not found');
        }
        const existingLink = await this.prisma.userDoctor.findFirst({
            where: {
                doctorId,
                patientId,
            },
        });
        if (existingLink) {
            if (existingLink.active) {
                throw new common_1.ConflictException('Patient is already linked to this doctor');
            }
            else {
                const reactivated = await this.prisma.userDoctor.update({
                    where: { id: existingLink.id },
                    data: { active: true },
                });
                return reactivated;
            }
        }
        const link = await this.prisma.userDoctor.create({
            data: {
                doctorId,
                patientId,
                active: true,
            },
        });
        return link;
    }
    async unlinkPatient(doctorId, patientId) {
        const link = await this.prisma.userDoctor.findFirst({
            where: {
                doctorId,
                patientId,
            },
        });
        if (!link) {
            throw new common_1.NotFoundException('Link not found');
        }
        await this.prisma.userDoctor.update({
            where: { id: link.id },
            data: { active: false },
        });
    }
    async getMyPatients(doctorId) {
        const links = await this.prisma.userDoctor.findMany({
            where: {
                doctorId,
                active: true,
            },
            include: {
                patient: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        return links.map((link) => ({
            id: link.patient.id,
            name: link.patient.name,
            email: link.patient.user.email,
            phone: link.patient.phone,
            birthDate: link.patient.birthDate,
            active: link.active,
            linkedAt: link.createdAt,
        }));
    }
    async getAllDoctorsOfPatient(patientId) {
        const links = await this.prisma.userDoctor.findMany({
            where: {
                patientId,
                active: true,
            },
            include: {
                doctor: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        return links.map((link) => ({
            id: link.doctor.id,
            name: link.doctor.name,
            email: link.doctor.user.email,
            specialty: link.doctor.specialty,
            linkedAt: link.createdAt,
        }));
    }
};
exports.DoctorPatientsService = DoctorPatientsService;
exports.DoctorPatientsService = DoctorPatientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_provider_1.PrismaService])
], DoctorPatientsService);
//# sourceMappingURL=doctor-patients.service.js.map