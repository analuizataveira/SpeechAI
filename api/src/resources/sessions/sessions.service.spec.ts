import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../../providers/database/prisma.provider';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockPrismaService = {
  exerciseList: {
    findUnique: jest.fn(),
  },
  session: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('SessionsService', () => {
  let service: SessionsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const patientId = 'pat-1';
    const createDto = {
      exerciseListId: 'list-1',
      startedAt: '2025-01-01T10:00:00Z',
    };

    it('deve criar uma sessão com sucesso', async () => {
      prisma.exerciseList.findUnique.mockResolvedValue({ id: 'list-1' });
      
      const mockSession = {
        id: 'sess-1',
        patientId,
        ...createDto,
        startedAt: new Date(createDto.startedAt),
        finishedAt: null as any,
      };
      prisma.session.create.mockResolvedValue(mockSession);

      const result = await service.create(patientId, createDto);

      expect(result).toEqual(mockSession);
      expect(prisma.exerciseList.findUnique).toHaveBeenCalledWith({ where: { id: 'list-1' } });
    });

    it('deve lançar NotFoundException se a lista não existir', async () => {
      prisma.exerciseList.findUnique.mockResolvedValue(null);

      await expect(service.create(patientId, createDto))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as sessões', async () => {
      const mockSessions = [{ id: 'sess-1', patient: {} }];
      prisma.session.findMany.mockResolvedValue(mockSessions);

      const result = await service.findAll();
      expect(result).toEqual(mockSessions);
    });
  });

  describe('findByPatient', () => {
    it('deve retornar sessões do paciente', async () => {
      const patientId = 'pat-1';
      const mockSessions = [{ id: 'sess-1', patientId }];
      prisma.session.findMany.mockResolvedValue(mockSessions);

      const result = await service.findByPatient(patientId);
      expect(result).toEqual(mockSessions);
    });
  });

  describe('findOne', () => {
    it('deve retornar uma sessão se encontrada', async () => {
      const mockSession = { id: 'sess-1' };
      prisma.session.findUnique.mockResolvedValue(mockSession);

      const result = await service.findOne('sess-1');
      expect(result).toEqual(mockSession);
    });

    it('deve lançar NotFoundException se não encontrar', async () => {
      prisma.session.findUnique.mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = { score: 100 };

    it('deve atualizar com sucesso se a sessão estiver ABERTA', async () => {
      prisma.session.findUnique.mockResolvedValue({ id: 'sess-1', finishedAt: null as any });
      
      const mockUpdated = { id: 'sess-1', finishedAt: null as any, score: 100 };
      prisma.session.update.mockResolvedValue(mockUpdated);

      const result = await service.update('sess-1', updateDto);

      expect(result).toEqual(mockUpdated);
    });

    it('deve lançar ForbiddenException se tentar atualizar sessão FINALIZADA', async () => {
      prisma.session.findUnique.mockResolvedValue({ 
        id: 'sess-1', 
        finishedAt: new Date() 
      });

      await expect(service.update('sess-1', updateDto))
        .rejects
        .toThrow(ForbiddenException);
    });

    it('deve lançar NotFoundException se a sessão não existir', async () => {
      prisma.session.findUnique.mockResolvedValue(null);
      await expect(service.update('999', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('completeSession', () => {
    const completeDto = { score: 90, correctItems: 9, errorLog: 'None' };

    it('deve finalizar a sessão', async () => {
      prisma.session.findUnique.mockResolvedValue({ id: 'sess-1' });
      
      const mockCompleted = { 
        id: 'sess-1', 
        ...completeDto, 
        finishedAt: new Date() 
      };
      prisma.session.update.mockResolvedValue(mockCompleted);

      const result = await service.completeSession('sess-1', completeDto);

      expect(result).toEqual(mockCompleted);
      expect(prisma.session.update).toHaveBeenCalledWith({
        where: { id: 'sess-1' },
        data: expect.objectContaining({ finishedAt: expect.any(Date) }),
      });
    });

    it('deve lançar NotFoundException se a sessão não existir', async () => {
      prisma.session.findUnique.mockResolvedValue(null);
      await expect(service.completeSession('999', completeDto))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});