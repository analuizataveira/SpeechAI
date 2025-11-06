import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../providers/database/prisma.provider';
import { IUsersService } from './interfaces/users.service.interface';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService implements IUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password, role, name, birthDate, phone, specialty } =
      createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user with profile
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        ...(role === UserRole.DOCTOR && {
          doctorProfile: {
            create: {
              name,
              birthDate: new Date(birthDate),
              phone,
              specialty: specialty,
            },
          },
        }),
        ...(role === UserRole.PATIENT && {
          patientProfile: {
            create: {
              name,
              birthDate: new Date(birthDate),
              phone,
            },
          },
        }),
      },
      include: {
        doctorProfile: true,
        patientProfile: true,
      },
    });

    const profile = user.doctorProfile || user.patientProfile;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: profile.name,
      birthDate: profile.birthDate,
      phone: profile.phone,
      specialty: user.doctorProfile?.specialty,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
