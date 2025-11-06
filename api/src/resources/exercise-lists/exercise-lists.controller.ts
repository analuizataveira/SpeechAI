import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ExerciseListsService } from './exercise-lists.service';
import { CreateExerciseListDto } from './dtos/create-exercise-list.dto';
import { JwtAuthGuard } from '../../framework/guards/jwt-auth.guard';
import { RolesGuard } from '../../framework/guards/roles.guard';
import { Roles } from '../../framework/decorators/roles.decorator';
import { RequestWithUser } from '../../config/types';
import { PrismaService } from '../../providers/database/prisma.provider';
import { UnauthorizedException } from '@nestjs/common';

@ApiTags('Exercise Lists')
@Controller('exercise-lists')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExerciseListsController {
  constructor(
    private readonly exerciseListsService: ExerciseListsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Create an exercise list' })
  async create(
    @Request() req: RequestWithUser,
    @Body() createExerciseListDto: CreateExerciseListDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: { doctorProfile: true },
    });
    if (!user?.doctorProfile) {
      throw new UnauthorizedException('User is not a doctor');
    }
    return this.exerciseListsService.create(
      user.doctorProfile.id,
      createExerciseListDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all exercise lists' })
  findAll() {
    return this.exerciseListsService.findAll();
  }

  @Get('my-lists')
  @Roles('DOCTOR')
  @ApiOperation({ summary: 'Get my exercise lists' })
  async findMyLists(@Request() req: RequestWithUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: { doctorProfile: true },
    });
    if (!user?.doctorProfile) {
      throw new UnauthorizedException('User is not a doctor');
    }
    return this.exerciseListsService.findByDoctor(user.doctorProfile.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an exercise list by id' })
  findOne(@Param('id') id: string) {
    return this.exerciseListsService.findOne(id);
  }
}
