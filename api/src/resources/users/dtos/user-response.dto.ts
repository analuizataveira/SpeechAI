import { UserRole } from '@prisma/client';

export class UserResponseDto {
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
