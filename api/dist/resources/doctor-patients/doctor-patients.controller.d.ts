import { DoctorPatientsService } from './doctor-patients.service';
import { LinkPatientDto } from './dtos/link-patient.dto';
import { PatientListResponseDto } from './dtos/patient-list-response.dto';
import { RequestWithUser } from '../../config/types';
import { PrismaService } from '../../providers/database/prisma.provider';
export declare class DoctorPatientsController {
    private readonly doctorPatientsService;
    private readonly prisma;
    constructor(doctorPatientsService: DoctorPatientsService, prisma: PrismaService);
    linkPatient(req: RequestWithUser, linkPatientDto: LinkPatientDto): Promise<import("./dtos/doctor-patient-response.dto").DoctorPatientResponseDto>;
    unlinkPatient(req: RequestWithUser, patientId: string): Promise<void>;
    getMyPatients(req: RequestWithUser): Promise<PatientListResponseDto[]>;
    getMyDoctors(req: RequestWithUser): Promise<{
        id: string;
        name: string;
        email: string;
        specialty: string;
        linkedAt: Date;
    }[]>;
}
