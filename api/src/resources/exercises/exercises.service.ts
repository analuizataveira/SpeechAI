import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma.provider';
import { IExercisesService } from './interfaces/exercises.service.interface';
import { CreateExerciseDto } from './dtos/create-exercise.dto';
import { ExerciseResponseDto } from './dtos/exercise-response.dto';

@Injectable()
export class ExercisesService implements IExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createExerciseDto: CreateExerciseDto,
  ): Promise<ExerciseResponseDto> {
    const diffType = await this.prisma.diffType.findUnique({
      where: { id: createExerciseDto.diffTypeId },
    });

    if (!diffType) {
      throw new NotFoundException('Difficulty type not found');
    }

    return this.prisma.exercise.create({
      data: createExerciseDto,
    });
  }

  async findAll(): Promise<ExerciseResponseDto[]> {
    return await this.prisma.exercise.findMany({
      include: {
        diffType: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByDiffType(diffTypeId: string): Promise<ExerciseResponseDto[]> {
    const diffType = await this.prisma.diffType.findUnique({
      where: { id: diffTypeId },
    });

    if (!diffType) {
      throw new NotFoundException('Difficulty type not found');
    }

    return this.prisma.exercise.findMany({
      where: { diffTypeId },
      include: {
        diffType: true,
      },
    });
  }

  async findOne(id: string): Promise<ExerciseResponseDto> {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
      include: { diffType: true },
    });
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
    return exercise;
  }
}
