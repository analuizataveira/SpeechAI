import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../providers/database/prisma.provider';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'app.jwtSecret') return 'segredo-teste';
    if (key === 'app.jwtExpiresIn') return '1h';
    return null;
  }),
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: typeof mockPrismaService;
  let jwtService: typeof mockJwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto = { email: 'teste@email.com', password: '123' };
    const mockUser = {
      id: 'user-1',
      email: 'teste@email.com',
      passwordHash: 'hash',
      role: 'DOCTOR',
    };

    it('deve retornar token se credenciais forem válidas', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('token-falso');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'token-falso',
        user: { id: mockUser.id, email: mockUser.email, role: mockUser.role },
      });
    });

    it('deve lançar erro se usuário não existir', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar erro se senha for incorreta', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMe', () => {
    const userId = 'user-1';

    it('deve retornar dados de MÉDICO', async () => {
      const mockDoctorUser = {
        id: userId,
        email: 'doc@email.com',
        role: 'DOCTOR',
        doctorProfile: {
          id: 'doc-p',
          name: 'Dr. House',
          birthDate: new Date(),
          phone: '123',
          specialty: 'Diagnostics',
        },
        patientProfile: null as any,
      };
      prisma.user.findUnique.mockResolvedValue(mockDoctorUser);

      const result = await service.getMe(userId);
      expect(result.role).toBe('DOCTOR');
      expect(result.doctorProfile).toBeDefined();
    });

    it('deve retornar dados de PACIENTE', async () => {
      const mockPatientUser = {
        id: userId,
        email: 'pat@email.com',
        role: 'PATIENT',
        doctorProfile: null as any,
        patientProfile: {
          id: 'pat-p',
          name: 'Paciente 01',
          birthDate: new Date(),
          phone: '999',
        },
      };
      prisma.user.findUnique.mockResolvedValue(mockPatientUser);

      const result = await service.getMe(userId);
      expect(result.role).toBe('PATIENT');
      expect(result.patientProfile).toBeDefined();
    });
  });

  describe('logout', () => {
    it('deve realizar logout', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      const result = await service.logout('user-1');
      expect(result.success).toBe(true);
    });
  });
});