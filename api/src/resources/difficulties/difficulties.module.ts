import { Module } from '@nestjs/common';
import { DifficultiesService } from './difficulties.service';
import { DifficultiesController } from './difficulties.controller';
import { PrismaService } from '../../providers/database/prisma.provider';

@Module({
  controllers: [DifficultiesController],
  providers: [DifficultiesService, PrismaService],
  exports: [DifficultiesService],
})
export class DifficultiesModule {}
