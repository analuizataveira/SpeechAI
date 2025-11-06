import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { MeResponseDto } from './dtos/me-response.dto';
import { JwtAuthGuard } from '../../framework/guards/jwt-auth.guard';
import { RequestWithUser } from '@src/config/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return await this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: RequestWithUser): Promise<MeResponseDto> {
    return await this.authService.getMe(req.user.id);
  }
}
