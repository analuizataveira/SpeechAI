import { Test, TestingModule } from '@nestjs/testing';
import { DifficultiesController } from './difficulties.controller';
import { DifficultiesService } from './difficulties.service';
import { PrismaService } from '../../providers/database/prisma.provider';
import { JwtAuthGuard } from '../../framework/guards/jwt-auth.guard';
import { RolesGuard } from '../../framework/guards/roles.guard';
import { UnauthorizedException } from '@nestjs/common';

const mockService = {
  create: jest.fn(),
  findByPatient: jest.fn(),
  remove: jest.fn(),
};

const mockPrisma = {
  user: { findUnique: jest.fn() },
};

describe('DifficultiesController', () => {
  let controller: DifficultiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DifficultiesController],
      providers: [
        { provide: DifficultiesService, useValue: mockService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DifficultiesController>(DifficultiesController);
  });

  it('deve criar uma dificuldade', async () => {
    const dto = { patientId: 'pat-1', diffTypeId: 'diff-1' };
    await controller.create(dto);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('deve buscar as dificuldades do PRÓPRIO paciente logado', async () => {
    const req = { user: { id: 'user-1' } };
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      patientProfile: { id: 'profile-pat-1' },
    });

    await controller.findMyDifficulties(req as any);

    expect(mockService.findByPatient).toHaveBeenCalledWith('profile-pat-1');
  });

  it('deve lançar erro em findMyDifficulties se usuário não for paciente', async () => {
    const req = { user: { id: 'user-doc' } };
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-doc',
      patientProfile: null,
    });

    await expect(controller.findMyDifficulties(req as any))
      .rejects
      .toThrow(UnauthorizedException);
  });
});