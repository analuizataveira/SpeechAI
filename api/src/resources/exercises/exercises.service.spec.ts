import { Test, TestingModule } from '@nestjs/testing';
import { ExercisesService } from './exercises.service';
import { PrismaService } from '../../providers/database/prisma.provider';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  diffType: {
    findUnique: jest.fn(),
  },
  exercise: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('ExercisesService', () => {
  let service: ExercisesService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExercisesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ExercisesService>(ExercisesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = { diffTypeId: 'diff-uuid', text: 'Exercício teste' };

    it('deve criar um exercício com sucesso se o diffType existir', async () => {
      prisma.diffType.findUnique.mockResolvedValue({ 
        id: 'diff-uuid', 
        description: 'Fácil',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const mockCreatedExercise = {
        id: 'ex-uuid',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.exercise.create.mockResolvedValue(mockCreatedExercise);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCreatedExercise);
      expect(prisma.diffType.findUnique).toHaveBeenCalledWith({ where: { id: 'diff-uuid' } });
      expect(prisma.exercise.create).toHaveBeenCalledWith({ data: createDto });
    });

    it('deve lançar NotFoundException se o diffType não existir', async () => {
      prisma.diffType.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto))
        .rejects
        .toThrow(NotFoundException);

      expect(prisma.exercise.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista de exercícios', async () => {
      const mockList = [
        { 
          id: '1', 
          text: 'Ex 1', 
          diffType: { id: 'd1', description: 'Fácil' }
        },
        { 
          id: '2', 
          text: 'Ex 2', 
          diffType: { id: 'd2', description: 'Difícil' }
        },
      ];
      prisma.exercise.findMany.mockResolvedValue(mockList);

      const result = await service.findAll();

      expect(result).toEqual(mockList);
      expect(prisma.exercise.findMany).toHaveBeenCalledWith({
        include: { diffType: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findByDiffType', () => {
    const diffTypeId = 'diff-uuid';

    it('deve retornar exercícios filtrados por tipo se o tipo existir', async () => {
      prisma.diffType.findUnique.mockResolvedValue({ 
        id: diffTypeId, 
        description: 'Fácil' 
      });
      
      const mockExercises = [{ 
        id: '1', 
        text: 'Teste', 
        diffTypeId,
        diffType: { id: diffTypeId, description: 'Fácil' }
      }];
      prisma.exercise.findMany.mockResolvedValue(mockExercises);

      const result = await service.findByDiffType(diffTypeId);

      expect(result).toEqual(mockExercises);
      expect(prisma.exercise.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { diffTypeId } })
      );
    });

    it('deve lançar NotFoundException se o diffType não existir', async () => {
      prisma.diffType.findUnique.mockResolvedValue(null);

      await expect(service.findByDiffType('id-inexistente'))
        .rejects
        .toThrow(NotFoundException);
      
      expect(prisma.exercise.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar um exercício único se encontrado', async () => {
      const mockExercise = { 
        id: '123', 
        text: 'Detalhe',
        diffType: { id: 'd1', description: 'Médio' }
      };
      prisma.exercise.findUnique.mockResolvedValue(mockExercise);

      const result = await service.findOne('123');

      expect(result).toEqual(mockExercise);
    });

    it('deve lançar NotFoundException se exercício não for encontrado', async () => {
      prisma.exercise.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999'))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});