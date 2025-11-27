import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma.provider';
import { IDoctorPatientsService } from './interfaces/doctor-patients.service.interface';
import { LinkPatientDto } from './dtos/link-patient.dto';
import { DoctorPatientResponseDto } from './dtos/doctor-patient-response.dto';
import { PatientListResponseDto } from './dtos/patient-list-response.dto';

@Injectable()
export class DoctorPatientsService implements IDoctorPatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async linkPatient(
    doctorId: string,
    linkPatientDto: LinkPatientDto,
  ): Promise<DoctorPatientResponseDto> {
    let { patientId } = linkPatientDto;
    const { patientEmail } = linkPatientDto;

    // Verify doctor profile exists
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { id: doctorId },
    });

    if (!doctorProfile) {
      throw new NotFoundException('Doctor profile not found');
    }

    // If patientEmail is provided, find patient by email
    if (patientEmail && !patientId) {
      const user = await this.prisma.user.findUnique({
        where: { email: patientEmail },
        include: { patientProfile: true },
      });

      if (!user) {
        throw new NotFoundException('User with this email not found');
      }

      if (!user.patientProfile) {
        throw new NotFoundException('User is not a patient');
      }

      patientId = user.patientProfile.id;
    }

    if (!patientId) {
      throw new NotFoundException('Patient ID or email is required');
    }

    // Verify patient profile exists
    const patientProfile = await this.prisma.patientProfile.findUnique({
      where: { id: patientId },
    });

    if (!patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    // Check if link already exists
    const existingLink = await this.prisma.userDoctor.findFirst({
      where: {
        doctorId,
        patientId,
      },
    });

    if (existingLink) {
      if (existingLink.active) {
        throw new ConflictException('Patient is already linked to this doctor');
      } else {
        // Reactivate the link
        const reactivated = await this.prisma.userDoctor.update({
          where: { id: existingLink.id },
          data: { active: true },
        });
        return reactivated;
      }
    }

    // Create new link
    const link = await this.prisma.userDoctor.create({
      data: {
        doctorId,
        patientId,
        active: true,
      },
    });

    return link;
  }

  async unlinkPatient(doctorId: string, patientId: string): Promise<void> {
    const link = await this.prisma.userDoctor.findFirst({
      where: {
        doctorId,
        patientId,
      },
    });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    await this.prisma.userDoctor.update({
      where: { id: link.id },
      data: { active: false },
    });
  }

  async getMyPatients(doctorId: string): Promise<PatientListResponseDto[]> {
    const links = await this.prisma.userDoctor.findMany({
      where: {
        doctorId,
        active: true,
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    return links.map((link) => ({
      id: link.patient.id,
      name: link.patient.name,
      email: link.patient.user.email,
      phone: link.patient.phone,
      birthDate: link.patient.birthDate,
      active: link.active,
      linkedAt: link.createdAt,
    }));
  }

  async getAllDoctorsOfPatient(patientId: string) {
    const links = await this.prisma.userDoctor.findMany({
      where: {
        patientId,
        active: true,
      },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });

    return links.map((link) => ({
      id: link.doctor.id,
      name: link.doctor.name,
      email: link.doctor.user.email,
      specialty: link.doctor.specialty,
      linkedAt: link.createdAt,
    }));
  }
}
