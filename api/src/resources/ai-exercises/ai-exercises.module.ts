import { Module } from '@nestjs/common';
import { AiExercisesService } from './ai-exercises.service';
import { AiExercisesController } from './ai-exercises.controller';
import { PrismaService } from '../../providers/database/prisma.provider';

@Module({
  controllers: [AiExercisesController],
  providers: [AiExercisesService, PrismaService],
  exports: [AiExercisesService],
})
export class AiExercisesModule {}

