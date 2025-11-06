import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma.provider';
import { IDiffTypesService } from './interfaces/diff-types.service.interface';
import { CreateDiffTypeDto } from './dtos/create-diff-type.dto';
import { UpdateDiffTypeDto } from './dtos/update-diff-type.dto';
import { DiffTypeResponseDto } from './dtos/diff-type-response.dto';

@Injectable()
export class DiffTypesService implements IDiffTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createDiffTypeDto: CreateDiffTypeDto,
  ): Promise<DiffTypeResponseDto> {
    const diffType = await this.prisma.diffType.create({
      data: createDiffTypeDto,
    });
    return diffType;
  }

  async findAll(): Promise<DiffTypeResponseDto[]> {
    return this.prisma.diffType.findMany({
      orderBy: { description: 'asc' },
    });
  }

  async findOne(id: string): Promise<DiffTypeResponseDto> {
    const diffType = await this.prisma.diffType.findUnique({
      where: { id },
    });
    if (!diffType) {
      throw new NotFoundException('Difficulty type not found');
    }
    return diffType;
  }

  async update(
    id: string,
    updateDiffTypeDto: UpdateDiffTypeDto,
  ): Promise<DiffTypeResponseDto> {
    const diffType = await this.prisma.diffType.findUnique({
      where: { id },
    });
    if (!diffType) {
      throw new NotFoundException('Difficulty type not found');
    }
    return this.prisma.diffType.update({
      where: { id },
      data: updateDiffTypeDto,
    });
  }

  async remove(id: string): Promise<void> {
    const diffType = await this.prisma.diffType.findUnique({
      where: { id },
    });
    if (!diffType) {
      throw new NotFoundException('Difficulty type not found');
    }
    await this.prisma.diffType.delete({
      where: { id },
    });
  }
}
