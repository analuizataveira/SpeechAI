import { Module } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { PrismaService } from '../../providers/database/prisma.provider';

@Module({
  controllers: [ExercisesController],
  providers: [ExercisesService, PrismaService],
  exports: [ExercisesService],
})
export class ExercisesModule {}
