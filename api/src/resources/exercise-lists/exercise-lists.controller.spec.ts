import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseListsController } from './exercise-lists.controller';
import { ExerciseListsService } from './exercise-lists.service';
import { PrismaService } from '../../providers/database/prisma.provider';
import { JwtAuthGuard } from '../../framework/guards/jwt-auth.guard';
import { RolesGuard } from '../../framework/guards/roles.guard';
import { UnauthorizedException } from '@nestjs/common';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByDoctor: jest.fn(),
  findOne: jest.fn(),
};

const mockPrisma = {
  user: { findUnique: jest.fn() },
};

describe('ExerciseListsController', () => {
  let controller: ExerciseListsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseListsController],
      providers: [
        { provide: ExerciseListsService, useValue: mockService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ExerciseListsController>(ExerciseListsController);
  });

  it('deve criar lista se for médico', async () => {
    const req = { user: { id: 'user-doc' } };
    const dto = { 
        title: 'Lista A', 
        diffTypeId: 'dt-1', 
        difficultyLevel: 'Easy', 
        exerciseIds: [] as string[]
    };

    mockPrisma.user.findUnique.mockResolvedValue({
      doctorProfile: { id: 'doc-1' },
    });

    await controller.create(req as any, dto);

    expect(mockService.create).toHaveBeenCalledWith('doc-1', dto);
  });

  it('deve lançar erro ao criar lista se não for médico', async () => {
    const req = { user: { id: 'user-pat' } };
    mockPrisma.user.findUnique.mockResolvedValue({
      doctorProfile: null,
    });

    await expect(controller.create(req as any, {} as any))
      .rejects
      .toThrow(UnauthorizedException);
  });

  it('deve buscar listas do próprio médico', async () => {
    const req = { user: { id: 'user-doc' } };
    mockPrisma.user.findUnique.mockResolvedValue({
      doctorProfile: { id: 'doc-1' },
    });

    await controller.findMyLists(req as any);
    expect(mockService.findByDoctor).toHaveBeenCalledWith('doc-1');
  });
});