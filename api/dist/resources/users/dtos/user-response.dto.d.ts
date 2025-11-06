import { UserRole } from '@prisma/client';
export declare class UserResponseDto {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    birthDate: Date;
    phone: string;
    specialty?: string;
    createdAt: Date;
    updatedAt: Date;
}
