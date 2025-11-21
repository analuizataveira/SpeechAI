import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseListsService } from './exercise-lists.service';
import { PrismaService } from '../../providers/database/prisma.provider';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  diffType: {
    findUnique: jest.fn(),
  },
  exercise: {
    findMany: jest.fn(),
  },
  exerciseList: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('ExerciseListsService', () => {
  let service: ExerciseListsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseListsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ExerciseListsService>(ExerciseListsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const doctorId = 'doc-uuid';
    const createDto = {
      diffTypeId: 'diff-1',
      title: 'Lista de Treino A',
      difficultyLevel: 'Hard',
      exerciseIds: ['ex-1', 'ex-2'],
    };

    it('deve criar uma lista com itens se DiffType e Exercises existirem', async () => {
      prisma.diffType.findUnique.mockResolvedValue({ id: 'diff-1', description: 'Hard' });
      prisma.exercise.findMany.mockResolvedValue([
        { id: 'ex-1' }, 
        { id: 'ex-2' }
      ]);

      const mockCreatedList = {
        id: 'list-1',
        ...createDto,
        items: [
          { exerciseId: 'ex-1', order: 0 },
          { exerciseId: 'ex-2', order: 1 },
        ],
      };
      prisma.exerciseList.create.mockResolvedValue(mockCreatedList);

      const result = await service.create(doctorId, createDto);

      expect(result).toEqual(mockCreatedList);

      expect(prisma.diffType.findUnique).toHaveBeenCalledWith({ where: { id: 'diff-1' } });

      expect(prisma.exercise.findMany).toHaveBeenCalledWith({ where: { id: { in: createDto.exerciseIds } } });

      expect(prisma.exerciseList.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            doctorId,
            items: {
              create: [
                { exerciseId: 'ex-1', order: 0 },
                { exerciseId: 'ex-2', order: 1 },
              ],
            },
          }),
        }),
      );
    });

    it('deve lançar NotFoundException se DiffType não existir', async () => {
      prisma.diffType.findUnique.mockResolvedValue(null);

      await expect(service.create(doctorId, createDto))
        .rejects
        .toThrow(NotFoundException);

      expect(prisma.exercise.findMany).not.toHaveBeenCalled();
      expect(prisma.exerciseList.create).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se algum exercício não existir', async () => {
      prisma.diffType.findUnique.mockResolvedValue({ id: 'diff-1' });
      prisma.exercise.findMany.mockResolvedValue([{ id: 'ex-1' }]);

      await expect(service.create(doctorId, createDto))
        .rejects
        .toThrow(NotFoundException);

      expect(prisma.exerciseList.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as listas com os includes corretos', async () => {
      const mockLists = [{ id: 'list-1', title: 'Treino' }];
      prisma.exerciseList.findMany.mockResolvedValue(mockLists);

      const result = await service.findAll();

      expect(result).toEqual(mockLists);
      expect(prisma.exerciseList.findMany).toHaveBeenCalledWith({
        include: expect.objectContaining({
          items: expect.any(Object),
          diffType: true,
          doctor: expect.any(Object),
        }),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findByDoctor', () => {
    it('deve retornar listas filtradas por doctorId', async () => {
      const doctorId = 'doc-123';
      const mockLists = [{ id: 'list-1', doctorId }];
      prisma.exerciseList.findMany.mockResolvedValue(mockLists);

      const result = await service.findByDoctor(doctorId);

      expect(result).toEqual(mockLists);
      expect(prisma.exerciseList.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { doctorId },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar uma lista específica se encontrada', async () => {
      const mockList = { id: 'list-1', title: 'Detalhe' };
      prisma.exerciseList.findUnique.mockResolvedValue(mockList);

      const result = await service.findOne('list-1');

      expect(result).toEqual(mockList);
      expect(prisma.exerciseList.findUnique).toHaveBeenCalledWith({
        where: { id: 'list-1' },
        include: expect.any(Object),
      });
    });

    it('deve lançar NotFoundException se a lista não existir', async () => {
      prisma.exerciseList.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999'))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});