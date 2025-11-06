import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma.provider';
import { IDifficultiesService } from './interfaces/difficulties.service.interface';
import { CreateDifficultyDto } from './dtos/create-difficulty.dto';
import { DifficultyResponseDto } from './dtos/difficulty-response.dto';

@Injectable()
export class DifficultiesService implements IDifficultiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createDifficultyDto: CreateDifficultyDto,
  ): Promise<DifficultyResponseDto> {
    // Verify patient exists
    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: createDifficultyDto.patientId },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Verify diff type exists
    const diffType = await this.prisma.diffType.findUnique({
      where: { id: createDifficultyDto.diffTypeId },
    });
    if (!diffType) {
      throw new NotFoundException('Difficulty type not found');
    }

    // Check if already exists
    const existing = await this.prisma.difficulty.findUnique({
      where: {
        patientId_diffTypeId: {
          patientId: createDifficultyDto.patientId,
          diffTypeId: createDifficultyDto.diffTypeId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Patient already has this difficulty');
    }

    return this.prisma.difficulty.create({
      data: createDifficultyDto,
    });
  }

  async findByPatient(patientId: string): Promise<DifficultyResponseDto[]> {
    return this.prisma.difficulty.findMany({
      where: { patientId },
      include: {
        diffType: true,
      },
    });
  }

  async remove(patientId: string, diffTypeId: string): Promise<void> {
    const difficulty = await this.prisma.difficulty.findUnique({
      where: {
        patientId_diffTypeId: {
          patientId,
          diffTypeId,
        },
      },
    });

    if (!difficulty) {
      throw new NotFoundException('Difficulty not found');
    }

    await this.prisma.difficulty.delete({
      where: { id: difficulty.id },
    });
  }
}
