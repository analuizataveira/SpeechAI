import { UserRole } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    password: string;
    role: UserRole;
    name: string;
    birthDate: string;
    phone: string;
    specialty?: string;
}
