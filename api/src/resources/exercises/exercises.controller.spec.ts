import { Test, TestingModule } from '@nestjs/testing';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';
import { JwtAuthGuard } from '../../framework/guards/jwt-auth.guard';
import { RolesGuard } from '../../framework/guards/roles.guard';

const mockExercisesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByDiffType: jest.fn(),
  findOne: jest.fn(),
};

describe('ExercisesController', () => {
  let controller: ExercisesController;
  let service: typeof mockExercisesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExercisesController],
      providers: [
        { provide: ExercisesService, useValue: mockExercisesService },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ExercisesController>(ExercisesController);
    service = module.get(ExercisesService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve chamar findAll corretamente', async () => {
    const mockList = [{ id: '1', text: 'Exercicio A' }];
    mockExercisesService.findAll.mockResolvedValue(mockList);

    const result = await controller.findAll();

    expect(result).toEqual(mockList);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('deve criar um exercício', async () => {
    const dto = { text: 'Rato', diffTypeId: 'uuid-123' };
    mockExercisesService.create.mockResolvedValue({ id: '1', ...dto });

    await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
  });
});