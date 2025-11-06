import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DifficultiesService } from './difficulties.service';
import { CreateDifficultyDto } from './dtos/create-difficulty.dto';
import { JwtAuthGuard } from '../../framework/guards/jwt-auth.guard';
import { RolesGuard } from '../../framework/guards/roles.guard';
import { Roles } from '../../framework/decorators/roles.decorator';
import { RequestWithUser } from '../../config/types';
import { PrismaService } from '../../providers/database/prisma.provider';
import { UnauthorizedException } from '@nestjs/common';

@ApiTags('Difficulties')
@Controller('difficulties')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DifficultiesController {
  constructor(
    private readonly difficultiesService: DifficultiesService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Create a difficulty for a patient' })
  create(@Body() createDifficultyDto: CreateDifficultyDto) {
    return this.difficultiesService.create(createDifficultyDto);
  }

  @Get('my-difficulties')
  @Roles('PATIENT')
  @ApiOperation({ summary: 'Get my difficulties' })
  async findMyDifficulties(@Request() req: RequestWithUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: { patientProfile: true },
    });
    if (!user?.patientProfile) {
      throw new UnauthorizedException('User is not a patient');
    }
    return this.difficultiesService.findByPatient(user.patientProfile.id);
  }

  @Get('patient/:patientId')
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Get difficulties for a patient' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.difficultiesService.findByPatient(patientId);
  }

  @Delete(':patientId/:diffTypeId')
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Remove a difficulty from a patient' })
  remove(
    @Param('patientId') patientId: string,
    @Param('diffTypeId') diffTypeId: string,
  ) {
    return this.difficultiesService.remove(patientId, diffTypeId);
  }
}
