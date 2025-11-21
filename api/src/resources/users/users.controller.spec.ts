import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserRole } from '@prisma/client';

const mockUsersService = {
  createUser: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: typeof mockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('deve chamar o service.createUser com os dados corretos', async () => {
      const dto: CreateUserDto = {
        email: 'teste@teste.com',
        password: '123',
        name: 'Teste',
        role: UserRole.PATIENT,
        birthDate: '2000-01-01',
        phone: '11999999999',
      };

      const resultMock = {
        id: '1',
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        birthDate: new Date(dto.birthDate),
      };

      mockUsersService.createUser.mockResolvedValue(resultMock);

      const result = await controller.createUser(dto);

      expect(result).toEqual(resultMock);
      expect(service.createUser).toHaveBeenCalledWith(dto);
    });
  });
});