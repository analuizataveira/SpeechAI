import { UserRole } from '@prisma/client';
export declare class AuthResponseDto {
    access_token: string;
    user: {
        id: string;
        email: string;
        role: UserRole;
    };
}
