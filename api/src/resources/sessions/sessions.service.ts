import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma.provider';
import { ISessionsService } from './interfaces/sessions.service.interface';
import { CreateSessionDto } from './dtos/create-session.dto';
import { UpdateSessionDto } from './dtos/update-session.dto';
import { SessionResponseDto } from './dtos/session-response.dto';

@Injectable()
export class SessionsService implements ISessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    patientId: string,
    createSessionDto: CreateSessionDto,
  ): Promise<SessionResponseDto> {
    // Verify exercise list exists
    const exerciseList = await this.prisma.exerciseList.findUnique({
      where: { id: createSessionDto.exerciseListId },
    });
    if (!exerciseList) {
      throw new NotFoundException('Exercise list not found');
    }

    const session = await this.prisma.session.create({
      data: {
        patientId,
        exerciseListId: createSessionDto.exerciseListId,
        startedAt: new Date(createSessionDto.startedAt),
      },
    });

    return session;
  }

  async findAll(): Promise<SessionResponseDto[]> {
    return this.prisma.session.findMany({
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        exerciseList: {
          include: {
            diffType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPatient(patientId: string): Promise<SessionResponseDto[]> {
    return this.prisma.session.findMany({
      where: { patientId },
      include: {
        exerciseList: {
          include: {
            diffType: true,
            items: {
              include: {
                exercise: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<any> {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        exerciseList: {
          include: {
            diffType: true,
            items: {
              include: {
                exercise: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
            doctor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async update(
    id: string,
    updateSessionDto: UpdateSessionDto,
  ): Promise<SessionResponseDto> {
    const session = await this.prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Business rule: sessions with finishedAt cannot be modified
    if (session.finishedAt) {
      throw new ForbiddenException('Cannot modify completed sessions');
    }

    return this.prisma.session.update({
      where: { id },
      data: updateSessionDto,
    });
  }

  // Method to be called by n8n webhook
  async completeSession(
    id: string,
    data: UpdateSessionDto,
  ): Promise<SessionResponseDto> {
    const session = await this.prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return this.prisma.session.update({
      where: { id },
      data: {
        ...data,
        finishedAt: new Date(),
      },
    });
  }
}
