import { Test, TestingModule } from '@nestjs/testing';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../../providers/database/prisma.provider';
import { JwtAuthGuard } from '../../framework/guards/jwt-auth.guard';
import { RolesGuard } from '../../framework/guards/roles.guard';
import { UnauthorizedException } from '@nestjs/common';

const mockSessionsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByPatient: jest.fn(),
  update: jest.fn(),
};

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
};

describe('SessionsController', () => {
  let controller: SessionsController;
  let sessionService: typeof mockSessionsService;
  let prismaService: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [
        { provide: SessionsService, useValue: mockSessionsService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SessionsController>(SessionsController);
    sessionService = module.get(SessionsService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar uma sessão se o usuário for um PACIENTE', async () => {
      const mockUserReq = { user: { id: 'user-123' } };
      const dto = { exerciseListId: 'list-1', startedAt: '2023-01-01' };
      
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        patientProfile: { id: 'profile-pat-1' }
      });

      const createdSession = { id: 'sess-1', ...dto };
      mockSessionsService.create.mockResolvedValue(createdSession);

      const result = await controller.create(mockUserReq as any, dto);

      expect(result).toEqual(createdSession);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ 
        where: { id: 'user-123' },
        include: { patientProfile: true }
      });
      expect(sessionService.create).toHaveBeenCalledWith('profile-pat-1', dto);
    });

    it('deve lançar UnauthorizedException se o usuário não for paciente', async () => {
      const mockUserReq = { user: { id: 'user-doc' } };
      
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-doc',
        patientProfile: null 
      });

      await expect(controller.create(mockUserReq as any, {} as any))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });

  describe('findMySessions', () => {
    it('deve buscar sessões usando o ID do profile do paciente', async () => {
      const mockUserReq = { user: { id: 'user-123' } };
      
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        patientProfile: { id: 'profile-pat-1' }
      });

      await controller.findMySessions(mockUserReq as any);

      expect(sessionService.findByPatient).toHaveBeenCalledWith('profile-pat-1');
    });
  });
});