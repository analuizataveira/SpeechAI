import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { MeResponseDto } from './dtos/me-response.dto';
import { RequestWithUser } from '@src/config/types';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    getMe(req: RequestWithUser): Promise<MeResponseDto>;
}
