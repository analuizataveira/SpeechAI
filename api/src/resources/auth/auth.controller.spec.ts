import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../framework/guards/jwt-auth.guard';
import { UnauthorizedException } from '@nestjs/common';

const mockAuthService = {
  login: jest.fn(),
  logout: jest.fn(),
  getMe: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: typeof mockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })

    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginDto = { email: 'teste@email.com', password: '123' };

    it('deve chamar authService.login com os dados corretos', async () => {
      const mockResult = {
        access_token: 'token-123',
        user: { id: '1', email: 'teste@email.com', role: 'DOCTOR' as any },
      };
      mockAuthService.login.mockResolvedValue(mockResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockResult);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });

    it('deve repassar a exceção se o service falhar', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException());

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMe', () => {
    it('deve pegar o ID do usuário de dentro da requisição (req.user) e chamar o service', async () => {

      const mockRequest = {
        user: { id: 'user-1', email: 'teste@email.com', role: 'DOCTOR' },
      };

      const mockResponse = {
        id: 'user-1',
        email: 'teste@email.com',
        role: 'DOCTOR' as any,
      };
      mockAuthService.getMe.mockResolvedValue(mockResponse);

      const result = await controller.getMe(mockRequest as any);

      expect(result).toEqual(mockResponse);
      expect(service.getMe).toHaveBeenCalledWith('user-1');
    });
  });

  describe('logout', () => {
    it('deve extrair o ID do usuário e chamar logout', async () => {
      const mockRequest = {
        user: { id: 'user-1' },
      };
      const mockResponse = { success: true, message: 'Logout successful' };
      mockAuthService.logout.mockResolvedValue(mockResponse);

      const result = await controller.logout(mockRequest as any);

      expect(result).toEqual(mockResponse);
      expect(service.logout).toHaveBeenCalledWith('user-1');
    });
  });
});