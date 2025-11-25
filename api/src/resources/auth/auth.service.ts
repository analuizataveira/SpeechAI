import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../providers/database/prisma.provider';
import { IAuthService } from './interfaces/auth.service.interface';
import { LoginDto } from './dtos/login.dto';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { MeResponseDto } from './dtos/me-response.dto';
import { LogoutResponseDto } from './dtos/logout-response.dto';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get('app.jwtSecret'),
      expiresIn: this.configService.get('app.jwtExpiresIn'),
    });

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getMe(userId: string): Promise<MeResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        doctorProfile: true,
        patientProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      doctorProfile: user.doctorProfile
        ? {
            id: user.doctorProfile.id,
            name: user.doctorProfile.name,
            birthDate: user.doctorProfile.birthDate,
            phone: user.doctorProfile.phone,
            specialty: user.doctorProfile.specialty,
          }
        : undefined,
      patientProfile: user.patientProfile
        ? {
            id: user.patientProfile.id,
            name: user.patientProfile.name,
            birthDate: user.patientProfile.birthDate,
            phone: user.patientProfile.phone,
          }
        : undefined,
    };
  }

  async logout(userId: string): Promise<LogoutResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // In a stateless JWT system, logout is primarily client-side
    // The token is removed from client storage
    // If you want to implement token blacklisting in the future,
    // you can add it here

    return {
      success: true,
      message: 'Logout successful',
    };
  }
}
