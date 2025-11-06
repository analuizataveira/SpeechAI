import { PrismaService } from '../../providers/database/prisma.provider';
import { IDoctorPatientsService } from './interfaces/doctor-patients.service.interface';
import { LinkPatientDto } from './dtos/link-patient.dto';
import { DoctorPatientResponseDto } from './dtos/doctor-patient-response.dto';
import { PatientListResponseDto } from './dtos/patient-list-response.dto';
export declare class DoctorPatientsService implements IDoctorPatientsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    linkPatient(doctorId: string, linkPatientDto: LinkPatientDto): Promise<DoctorPatientResponseDto>;
    unlinkPatient(doctorId: string, patientId: string): Promise<void>;
    getMyPatients(doctorId: string): Promise<PatientListResponseDto[]>;
    getAllDoctorsOfPatient(patientId: string): Promise<{
        id: string;
        name: string;
        email: string;
        specialty: string;
        linkedAt: Date;
    }[]>;
}
