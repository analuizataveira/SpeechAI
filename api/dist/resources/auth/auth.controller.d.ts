import { RequestWithUser } from '@src/config/types';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { LoginDto } from './dtos/login.dto';
import { LogoutResponseDto } from './dtos/logout-response.dto';
import { MeResponseDto } from './dtos/me-response.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    logout(req: RequestWithUser): Promise<LogoutResponseDto>;
    getMe(req: RequestWithUser): Promise<MeResponseDto>;
}
