export interface ILinkPatientRequest {
  patientId?: string;
  patientEmail?: string;
}

export interface IDoctorPatientResponse {
  id: string;
  doctorId: string;
  patientId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPatientListResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: Date;
  active: boolean;
  linkedAt: Date;
}

export interface IDoctorListResponse {
  id: string;
  name: string;
  email: string;
  specialty: string;
  linkedAt: Date;
}

