import { LinkPatientDto } from '../dtos/link-patient.dto';
import { DoctorPatientResponseDto } from '../dtos/doctor-patient-response.dto';
import { PatientListResponseDto } from '../dtos/patient-list-response.dto';

export interface IDoctorPatientsService {
  linkPatient(
    doctorId: string,
    linkPatientDto: LinkPatientDto,
  ): Promise<DoctorPatientResponseDto>;
  unlinkPatient(doctorId: string, patientId: string): Promise<void>;
  getMyPatients(doctorId: string): Promise<PatientListResponseDto[]>;
  getAllDoctorsOfPatient(patientId: string): Promise<any[]>;
}
