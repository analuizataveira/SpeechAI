import { UserRole } from '@prisma/client';
export declare class MeResponseDto {
    id: string;
    email: string;
    role: UserRole;
    doctorProfile?: {
        id: string;
        name: string;
        birthDate: Date;
        phone: string;
        specialty: string;
    };
    patientProfile?: {
        id: string;
        name: string;
        birthDate: Date;
        phone: string;
    };
}
