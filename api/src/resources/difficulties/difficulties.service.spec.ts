import { Test, TestingModule } from '@nestjs/testing';
import { DifficultiesService } from './difficulties.service';
import { PrismaService } from '../../providers/database/prisma.provider';
import { NotFoundException, ConflictException } from '@nestjs/common';

const mockPrismaService = {
  patientProfile: {
    findUnique: jest.fn(),
  },
  diffType: {
    findUnique: jest.fn(),
  },
  difficulty: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
};

describe('DifficultiesService', () => {
  let service: DifficultiesService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DifficultiesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DifficultiesService>(DifficultiesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = { patientId: 'pat-1', diffTypeId: 'diff-1' };

    it('deve criar uma dificuldade com sucesso (Cenário Feliz)', async () => {
      prisma.patientProfile.findUnique.mockResolvedValue({ id: 'pat-1' });
      prisma.diffType.findUnique.mockResolvedValue({ id: 'diff-1' });
      prisma.difficulty.findUnique.mockResolvedValue(null);
      
      const mockCreated = { id: 'uuid-res', ...createDto };
      prisma.difficulty.create.mockResolvedValue(mockCreated);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCreated);
      expect(prisma.patientProfile.findUnique).toHaveBeenCalledWith({ where: { id: 'pat-1' } });
      expect(prisma.diffType.findUnique).toHaveBeenCalledWith({ where: { id: 'diff-1' } });
      expect(prisma.difficulty.findUnique).toHaveBeenCalledWith({
        where: {
          patientId_diffTypeId: {
            patientId: createDto.patientId,
            diffTypeId: createDto.diffTypeId,
          },
        },
      });
      
      expect(prisma.difficulty.create).toHaveBeenCalledWith({ data: createDto });
    });

    it('deve lançar NotFoundException se o Paciente não existir', async () => {
      prisma.patientProfile.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto))
        .rejects
        .toThrow(NotFoundException);

      expect(prisma.diffType.findUnique).not.toHaveBeenCalled();
      expect(prisma.difficulty.create).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se o DiffType não existir', async () => {
      prisma.patientProfile.findUnique.mockResolvedValue({ id: 'pat-1' });
      prisma.diffType.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto))
        .rejects
        .toThrow(NotFoundException);

      expect(prisma.difficulty.create).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException se a Dificuldade já existir', async () => {
      prisma.patientProfile.findUnique.mockResolvedValue({ id: 'pat-1' });
      prisma.diffType.findUnique.mockResolvedValue({ id: 'diff-1' });
      prisma.difficulty.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(service.create(createDto))
        .rejects
        .toThrow(ConflictException);

      expect(prisma.difficulty.create).not.toHaveBeenCalled();
    });
  });

  describe('findByPatient', () => {
    it('deve retornar lista de dificuldades do paciente', async () => {
      const mockList = [{ id: '1', patientId: 'pat-1', diffTypeId: 'diff-1' }];
      prisma.difficulty.findMany.mockResolvedValue(mockList);

      const result = await service.findByPatient('pat-1');

      expect(result).toEqual(mockList);
      expect(prisma.difficulty.findMany).toHaveBeenCalledWith({
        where: { patientId: 'pat-1' },
        include: { diffType: true },
      });
    });
  });

  describe('remove', () => {
    const patientId = 'pat-1';
    const diffTypeId = 'diff-1';

    it('deve remover com sucesso se a dificuldade existir', async () => {
      const mockFoundDifficulty = { id: 'uuid-to-delete', patientId, diffTypeId };
      prisma.difficulty.findUnique.mockResolvedValue(mockFoundDifficulty);
      
      prisma.difficulty.delete.mockResolvedValue(mockFoundDifficulty);

      await service.remove(patientId, diffTypeId);

      expect(prisma.difficulty.findUnique).toHaveBeenCalledWith({
        where: {
          patientId_diffTypeId: { patientId, diffTypeId },
        },
      });
      expect(prisma.difficulty.delete).toHaveBeenCalledWith({
        where: { id: 'uuid-to-delete' },
      });
    });

    it('deve lançar NotFoundException se a dificuldade não for encontrada', async () => {
      prisma.difficulty.findUnique.mockResolvedValue(null);

      await expect(service.remove(patientId, diffTypeId))
        .rejects
        .toThrow(NotFoundException);

      expect(prisma.difficulty.delete).not.toHaveBeenCalled();
    });
  });
});