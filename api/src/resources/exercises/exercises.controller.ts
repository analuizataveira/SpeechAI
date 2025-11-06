import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dtos/create-exercise.dto';
import { JwtAuthGuard } from '../../framework/guards/jwt-auth.guard';
import { RolesGuard } from '../../framework/guards/roles.guard';
import { Roles } from '../../framework/decorators/roles.decorator';

@ApiTags('Exercises')
@Controller('exercises')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Create an exercise' })
  create(@Body() createExerciseDto: CreateExerciseDto) {
    return this.exercisesService.create(createExerciseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all exercises' })
  findAll() {
    return this.exercisesService.findAll();
  }

  @Get('diff-type/:diffTypeId')
  @ApiOperation({ summary: 'Get exercises by difficulty type' })
  findByDiffType(@Param('diffTypeId') diffTypeId: string) {
    return this.exercisesService.findByDiffType(diffTypeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an exercise by id' })
  findOne(@Param('id') id: string) {
    return this.exercisesService.findOne(id);
  }
}
