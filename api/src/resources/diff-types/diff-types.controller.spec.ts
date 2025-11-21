import { Test, TestingModule } from '@nestjs/testing';
import { DiffTypesController } from './diff-types.controller';
import { DiffTypesService } from './diff-types.service';
import { JwtAuthGuard } from '../../framework/guards/jwt-auth.guard';
import { RolesGuard } from '../../framework/guards/roles.guard';

const mockDiffTypesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('DiffTypesController', () => {
  let controller: DiffTypesController;
  let service: typeof mockDiffTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiffTypesController],
      providers: [
        { provide: DiffTypesService, useValue: mockDiffTypesService },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DiffTypesController>(DiffTypesController);
    service = module.get(DiffTypesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar um tipo de dificuldade', async () => {
    const dto = { description: 'Gagueira' };
    mockDiffTypesService.create.mockResolvedValue({ id: '1', ...dto });

    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('deve buscar todos', async () => {
    mockDiffTypesService.findAll.mockResolvedValue([]);
    await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('deve atualizar', async () => {
    const dto = { description: 'Nova Descrição' };
    await controller.update('1', dto);
    expect(service.update).toHaveBeenCalledWith('1', dto);
  });

  it('deve remover', async () => {
    await controller.remove('1');
    expect(service.remove).toHaveBeenCalledWith('1');
  });
});