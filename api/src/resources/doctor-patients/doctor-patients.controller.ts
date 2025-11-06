import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DoctorPatientsService } from './doctor-patients.service';
import { LinkPatientDto } from './dtos/link-patient.dto';
import { PatientListResponseDto } from './dtos/patient-list-response.dto';
import { JwtAuthGuard } from '../../framework/guards/jwt-auth.guard';
import { RolesGuard } from '../../framework/guards/roles.guard';
import { Roles } from '../../framework/decorators/roles.decorator';
import { RequestWithUser } from '../../config/types';
import { PrismaService } from '../../providers/database/prisma.provider';

@ApiTags('Doctor Patients')
@Controller('doctor-patients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DoctorPatientsController {
  constructor(
    private readonly doctorPatientsService: DoctorPatientsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('link')
  @Roles('DOCTOR')
  @ApiOperation({ summary: 'Link a patient to the doctor' })
  async linkPatient(
    @Request() req: RequestWithUser,
    @Body() linkPatientDto: LinkPatientDto,
  ) {
    // Get doctor profile id from user
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        doctorProfile: true,
        patientProfile: true,
      },
    });
    if (!user?.doctorProfile) {
      throw new UnauthorizedException('User is not a doctor');
    }
    return this.doctorPatientsService.linkPatient(
      user.doctorProfile.id,
      linkPatientDto,
    );
  }

  @Delete('unlink/:patientId')
  @Roles('DOCTOR')
  @ApiOperation({ summary: 'Unlink a patient from the doctor' })
  async unlinkPatient(
    @Request() req: RequestWithUser,
    @Param('patientId') patientId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        doctorProfile: true,
        patientProfile: true,
      },
    });
    if (!user?.doctorProfile) {
      throw new UnauthorizedException('User is not a doctor');
    }
    await this.doctorPatientsService.unlinkPatient(
      user.doctorProfile.id,
      patientId,
    );
  }

  @Get('my-patients')
  @Roles('DOCTOR')
  @ApiOperation({ summary: 'Get all patients linked to the doctor' })
  async getMyPatients(
    @Request() req: RequestWithUser,
  ): Promise<PatientListResponseDto[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        doctorProfile: true,
        patientProfile: true,
      },
    });
    if (!user?.doctorProfile) {
      throw new UnauthorizedException('User is not a doctor');
    }
    return this.doctorPatientsService.getMyPatients(user.doctorProfile.id);
  }

  @Get('my-doctors')
  @Roles('PATIENT')
  @ApiOperation({ summary: 'Get all doctors linked to the patient' })
  async getMyDoctors(@Request() req: RequestWithUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        doctorProfile: true,
        patientProfile: true,
      },
    });
    if (!user?.patientProfile) {
      throw new UnauthorizedException('User is not a patient');
    }
    return this.doctorPatientsService.getAllDoctorsOfPatient(
      user.patientProfile.id,
    );
  }
}
