import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../providers/database/prisma.provider';
import { ConflictException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const mockCreateUserDto = {
      email: 'teste@exemplo.com',
      password: 'senha123',
      role: UserRole.DOCTOR,
      name: 'Dr. Teste',
      birthDate: '1990-01-01',
      phone: '123456789',
      specialty: 'Cardiologia',
    };

    it('deve criar um usuário DOCTOR com sucesso', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const mockUserDoctor = {
        id: 'uuid-1',
        email: mockCreateUserDto.email,
        role: 'DOCTOR',
        createdAt: new Date(),
        updatedAt: new Date(),
        doctorProfile: {
          name: mockCreateUserDto.name,
          specialty: mockCreateUserDto.specialty,
          birthDate: new Date(mockCreateUserDto.birthDate),
          phone: mockCreateUserDto.phone,
        },
        patientProfile: null as any,
      };

      mockPrismaService.user.create.mockResolvedValue(mockUserDoctor);

      const result = await service.createUser(mockCreateUserDto as any);

      expect(result.role).toBe('DOCTOR');
      
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            doctorProfile: expect.anything(),
          }),
        }),
      );
    });

    it('deve criar um usuário PATIENT com sucesso', async () => {
      const patientDto = { 
        ...mockCreateUserDto, 
        role: UserRole.PATIENT, 
        specialty: undefined as any 
      };
      
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const mockUserPatient = {
        id: 'uuid-2',
        email: patientDto.email,
        role: 'PATIENT',
        createdAt: new Date(),
        updatedAt: new Date(),
        doctorProfile: null as any,
        patientProfile: {
          name: patientDto.name,
          birthDate: new Date(patientDto.birthDate),
          phone: patientDto.phone,
        },
      };

      mockPrismaService.user.create.mockResolvedValue(mockUserPatient);

      const result = await service.createUser(patientDto as any);

      expect(result.role).toBe('PATIENT');
      
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            patientProfile: expect.anything(),
          }),
        }),
      );
    });

    it('deve lançar erro ConflictException se o email já existir', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'id-existente' });

      await expect(service.createUser(mockCreateUserDto as any))
        .rejects
        .toThrow(ConflictException);

      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });
});