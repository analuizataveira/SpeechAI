import { Module } from '@nestjs/common';
import { DiffTypesService } from './diff-types.service';
import { DiffTypesController } from './diff-types.controller';
import { PrismaService } from '../../providers/database/prisma.provider';

@Module({
  controllers: [DiffTypesController],
  providers: [DiffTypesService, PrismaService],
  exports: [DiffTypesService],
})
export class DiffTypesModule {}
