import { LoginDto } from '../dtos/login.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { MeResponseDto } from '../dtos/me-response.dto';
export interface IAuthService {
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    getMe(userId: string): Promise<MeResponseDto>;
}
