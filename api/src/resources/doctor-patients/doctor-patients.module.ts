import { Module } from '@nestjs/common';
import { DoctorPatientsController } from './doctor-patients.controller';
import { DoctorPatientsService } from './doctor-patients.service';
import { PrismaService } from '../../providers/database/prisma.provider';

@Module({
  controllers: [DoctorPatientsController],
  providers: [DoctorPatientsService, PrismaService],
  exports: [DoctorPatientsService],
})
export class DoctorPatientsModule {}
