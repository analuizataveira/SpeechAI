import { Test, TestingModule } from '@nestjs/testing';
import { DoctorPatientsService } from './doctor-patients.service';
import { PrismaService } from '../../providers/database/prisma.provider';
import { NotFoundException, ConflictException } from '@nestjs/common';

const mockPrismaService = {
  doctorProfile: {
    findUnique: jest.fn(),
  },
  patientProfile: {
    findUnique: jest.fn(),
  },
  userDoctor: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('DoctorPatientsService', () => {
  let service: DoctorPatientsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorPatientsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DoctorPatientsService>(DoctorPatientsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('linkPatient', () => {
    const doctorId = 'doc-1';
    const dto = { patientId: 'pat-1' };

    it('deve CRIAR um novo vínculo se não existir nenhum anterior', async () => {
      prisma.doctorProfile.findUnique.mockResolvedValue({ id: doctorId });
      prisma.patientProfile.findUnique.mockResolvedValue({ id: dto.patientId });
      prisma.userDoctor.findFirst.mockResolvedValue(null);

      const mockCreatedLink = { id: 'link-1', doctorId, patientId: dto.patientId, active: true };
      prisma.userDoctor.create.mockResolvedValue(mockCreatedLink);

      const result = await service.linkPatient(doctorId, dto);

      expect(result).toEqual(mockCreatedLink);
      expect(prisma.userDoctor.create).toHaveBeenCalledWith({
        data: { doctorId, patientId: dto.patientId, active: true },
      });
    });

    it('deve REATIVAR um vínculo se ele existir mas estiver inativo', async () => {
      prisma.doctorProfile.findUnique.mockResolvedValue({ id: doctorId });
      prisma.patientProfile.findUnique.mockResolvedValue({ id: dto.patientId });
      prisma.userDoctor.findFirst.mockResolvedValue({ id: 'link-1', active: false });

      const mockReactivated = { id: 'link-1', active: true };
      prisma.userDoctor.update.mockResolvedValue(mockReactivated);

      const result = await service.linkPatient(doctorId, dto);

      expect(result).toEqual(mockReactivated);
      expect(prisma.userDoctor.update).toHaveBeenCalledWith({
        where: { id: 'link-1' },
        data: { active: true },
      });
      expect(prisma.userDoctor.create).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException se já existir um vínculo ATIVO', async () => {
      prisma.doctorProfile.findUnique.mockResolvedValue({ id: doctorId });
      prisma.patientProfile.findUnique.mockResolvedValue({ id: dto.patientId });
      prisma.userDoctor.findFirst.mockResolvedValue({ id: 'link-1', active: true });

      await expect(service.linkPatient(doctorId, dto))
        .rejects
        .toThrow(ConflictException);
      
      expect(prisma.userDoctor.create).not.toHaveBeenCalled();
      expect(prisma.userDoctor.update).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se o Médico não existir', async () => {
      prisma.doctorProfile.findUnique.mockResolvedValue(null);

      await expect(service.linkPatient(doctorId, dto)).rejects.toThrow(NotFoundException);
      
      expect(prisma.patientProfile.findUnique).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se o Paciente não existir', async () => {
      prisma.doctorProfile.findUnique.mockResolvedValue({ id: doctorId });
      prisma.patientProfile.findUnique.mockResolvedValue(null);

      await expect(service.linkPatient(doctorId, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('unlinkPatient', () => {
    const doctorId = 'doc-1';
    const patientId = 'pat-1';

    it('deve desativar o vínculo com sucesso', async () => {
      prisma.userDoctor.findFirst.mockResolvedValue({ id: 'link-1' });
      prisma.userDoctor.update.mockResolvedValue({});

      await service.unlinkPatient(doctorId, patientId);

      expect(prisma.userDoctor.update).toHaveBeenCalledWith({
        where: { id: 'link-1' },
        data: { active: false },
      });
    });

    it('deve lançar NotFoundException se o vínculo não existir', async () => {
      prisma.userDoctor.findFirst.mockResolvedValue(null);

      await expect(service.unlinkPatient(doctorId, patientId))
        .rejects
        .toThrow(NotFoundException);

      expect(prisma.userDoctor.update).not.toHaveBeenCalled();
    });
  });

  describe('getMyPatients', () => {
    it('deve retornar a lista formatada corretamente', async () => {
      const mockPrismaResponse = [
        {
          patient: {
            id: 'pat-1',
            name: 'João',
            phone: '123',
            birthDate: new Date('1990-01-01'),
            user: { email: 'joao@email.com' },
          },
          active: true,
          createdAt: new Date(),
        },
      ];

      prisma.userDoctor.findMany.mockResolvedValue(mockPrismaResponse);

      const result = await service.getMyPatients('doc-1');

      expect(result[0]).toEqual({
        id: 'pat-1',
        name: 'João',
        email: 'joao@email.com',
        phone: '123',
        birthDate: new Date('1990-01-01'),
        active: true,
        linkedAt: expect.any(Date),
      });
    });
  });

  describe('getAllDoctorsOfPatient', () => {
    it('deve retornar a lista de médicos formatada', async () => {
      const mockPrismaResponse = [
        {
          doctor: {
            id: 'doc-1',
            name: 'Dr. House',
            specialty: 'Diagnóstico',
            user: { email: 'house@email.com' },
          },
          createdAt: new Date(),
        },
      ];

      prisma.userDoctor.findMany.mockResolvedValue(mockPrismaResponse);

      const result = await service.getAllDoctorsOfPatient('pat-1');

      expect(result[0]).toEqual({
        id: 'doc-1',
        name: 'Dr. House',
        email: 'house@email.com',
        specialty: 'Diagnóstico',
        linkedAt: expect.any(Date),
      });
    });
  });
});