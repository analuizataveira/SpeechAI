import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../providers/database/prisma.provider';
import { IAuthService } from './interfaces/auth.service.interface';
import { LoginDto } from './dtos/login.dto';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { MeResponseDto } from './dtos/me-response.dto';
export declare class AuthService implements IAuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    getMe(userId: string): Promise<MeResponseDto>;
}
