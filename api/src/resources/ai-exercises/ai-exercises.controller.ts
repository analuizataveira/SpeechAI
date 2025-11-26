import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../framework/guards/jwt-auth.guard';
import { RolesGuard } from '../../framework/guards/roles.guard';
import { Roles } from '../../framework/decorators/roles.decorator';
import { RequestWithUser } from '../../config/types';
import { PrismaService } from '../../providers/database/prisma.provider';
import { AiExercisesService } from './ai-exercises.service';
import { GenerateExercisesDto } from './dtos/generate-exercises.dto';
import { GenerateExercisesResponseDto } from './dtos/generate-exercises.dto';

@ApiTags('AI Exercises')
@Controller('ai-exercises')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AiExercisesController {
  constructor(
    private readonly aiExercisesService: AiExercisesService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('generate')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Generate personalized exercises using AI' })
  async generateExercises(
    @Request() req: RequestWithUser,
    @Body() generateExercisesDto: GenerateExercisesDto,
  ): Promise<GenerateExercisesResponseDto> {
    const userId = req.user.id;
    let patientId = generateExercisesDto.patientId;

    // If patientId not provided, use current user's patient profile
    if (!patientId) {
      if (req.user.role !== 'PATIENT') {
        throw new UnauthorizedException(
          'Patient ID is required for non-patient users',
        );
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { patientProfile: true },
      });

      if (!user?.patientProfile) {
        throw new UnauthorizedException('User is not a patient');
      }

      patientId = user.patientProfile.id;
    }

    return this.aiExercisesService.generateExercises(patientId, userId);
  }

  @Post('generate-and-create-list')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  @ApiOperation({
    summary: 'Generate personalized exercises and create exercise list',
  })
  async generateExercisesAndCreateList(
    @Request() req: RequestWithUser,
    @Body() generateExercisesDto: GenerateExercisesDto,
  ) {
    const userId = req.user.id;
    let patientId = generateExercisesDto.patientId;

    // If patientId not provided, use current user's patient profile
    if (!patientId) {
      if (req.user.role !== 'PATIENT') {
        throw new UnauthorizedException(
          'Patient ID is required for non-patient users',
        );
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { patientProfile: true },
      });

      if (!user?.patientProfile) {
        throw new UnauthorizedException('User is not a patient');
      }

      patientId = user.patientProfile.id;
    }

    return this.aiExercisesService.generateExercisesAndCreateList(
      patientId,
      userId,
    );
  }
}

