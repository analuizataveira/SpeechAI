import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma.provider';
import { IExerciseListsService } from './interfaces/exercise-lists.service.interface';
import { CreateExerciseListDto } from './dtos/create-exercise-list.dto';
import { ExerciseListResponseDto } from './dtos/exercise-list-response.dto';

@Injectable()
export class ExerciseListsService implements IExerciseListsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    doctorId: string,
    createExerciseListDto: CreateExerciseListDto,
  ): Promise<ExerciseListResponseDto> {
    const { exerciseIds, diffTypeId, title, difficultyLevel } =
      createExerciseListDto;

    // Verify diff type exists
    const diffType = await this.prisma.diffType.findUnique({
      where: { id: diffTypeId },
    });
    if (!diffType) {
      throw new NotFoundException('Difficulty type not found');
    }

    // Verify all exercises exist
    const exercises = await this.prisma.exercise.findMany({
      where: { id: { in: exerciseIds } },
    });

    if (exercises.length !== exerciseIds.length) {
      throw new NotFoundException('One or more exercises not found');
    }

    // Create exercise list with items
    const exerciseList = await this.prisma.exerciseList.create({
      data: {
        doctorId,
        diffTypeId,
        title,
        difficultyLevel,
        items: {
          create: exerciseIds.map((exerciseId, index) => ({
            exerciseId,
            order: index,
          })),
        },
      },
      include: {
        items: {
          include: {
            exercise: true,
          },
        },
        diffType: true,
      },
    });

    return exerciseList;
  }

  async findAll(): Promise<ExerciseListResponseDto[]> {
    return this.prisma.exerciseList.findMany({
      include: {
        items: {
          include: {
            exercise: true,
          },
        },
        diffType: true,
        doctor: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByDoctor(doctorId: string): Promise<ExerciseListResponseDto[]> {
    return this.prisma.exerciseList.findMany({
      where: { doctorId },
      include: {
        items: {
          include: {
            exercise: true,
          },
        },
        diffType: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<any> {
    const exerciseList = await this.prisma.exerciseList.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            exercise: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        diffType: true,
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!exerciseList) {
      throw new NotFoundException('Exercise list not found');
    }

    return exerciseList;
  }
}
