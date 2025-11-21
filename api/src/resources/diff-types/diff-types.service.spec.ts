import { Test, TestingModule } from '@nestjs/testing';
import { DiffTypesService } from './diff-types.service';
import { PrismaService } from '../../providers/database/prisma.provider';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  diffType: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('DiffTypesService', () => {
  let service: DiffTypesService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiffTypesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DiffTypesService>(DiffTypesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um tipo de dificuldade com sucesso', async () => {
      const createDto = { description: 'Difícil' };
      const mockResult = {
        id: '1',
        description: 'Difícil',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.diffType.create.mockResolvedValue(mockResult);

      const result = await service.create(createDto);

      expect(result).toEqual(mockResult);
      expect(prisma.diffType.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista ordenada por descrição', async () => {
      const mockList = [
        { id: '1', description: 'Fácil', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', description: 'Médio', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockPrismaService.diffType.findMany.mockResolvedValue(mockList);

      const result = await service.findAll();

      expect(result).toEqual(mockList);
      expect(prisma.diffType.findMany).toHaveBeenCalledWith({
        orderBy: { description: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar um diffType se encontrado', async () => {
      const mockDiffType = { id: '1', description: 'Fácil' };
      mockPrismaService.diffType.findUnique.mockResolvedValue(mockDiffType);

      const result = await service.findOne('1');

      expect(result).toEqual(mockDiffType);
    });

    it('deve lançar NotFoundException se não encontrado', async () => {
      mockPrismaService.diffType.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = { description: 'Muito Difícil' };

    it('deve atualizar com sucesso se o registro existir', async () => {

      mockPrismaService.diffType.findUnique.mockResolvedValue({ id: '1', description: 'Difícil' });
      
      const mockUpdated = { id: '1', description: 'Muito Difícil' };
      mockPrismaService.diffType.update.mockResolvedValue(mockUpdated);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(mockUpdated);
      expect(prisma.diffType.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
      });
    });

    it('deve lançar NotFoundException ao tentar atualizar registro inexistente', async () => {
      mockPrismaService.diffType.findUnique.mockResolvedValue(null);

      await expect(service.update('999', updateDto)).rejects.toThrow(NotFoundException);
      
      expect(prisma.diffType.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve deletar com sucesso se o registro existir', async () => {

      mockPrismaService.diffType.findUnique.mockResolvedValue({ id: '1' });
      
      mockPrismaService.diffType.delete.mockResolvedValue({ id: '1' });

      await service.remove('1');

      expect(prisma.diffType.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('deve lançar NotFoundException ao tentar deletar registro inexistente', async () => {
      mockPrismaService.diffType.findUnique.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
      
      expect(prisma.diffType.delete).not.toHaveBeenCalled();
    });
  });
});