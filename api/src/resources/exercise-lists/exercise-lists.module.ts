import { Module } from '@nestjs/common';
import { ExerciseListsService } from './exercise-lists.service';
import { ExerciseListsController } from './exercise-lists.controller';
import { PrismaService } from '../../providers/database/prisma.provider';

@Module({
  controllers: [ExerciseListsController],
  providers: [ExerciseListsService, PrismaService],
  exports: [ExerciseListsService],
})
export class ExerciseListsModule {}
