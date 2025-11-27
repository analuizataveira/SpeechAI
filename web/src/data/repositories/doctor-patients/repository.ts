import { EitherResponse } from '@/domain/types/http';
import { BaseRepository } from '../base';
import {
  ILinkPatientRequest,
  IDoctorPatientResponse,
  IPatientListResponse,
  IDoctorListResponse,
} from './interface';

export class DoctorPatientsRepository extends BaseRepository {
  constructor() {
    super('doctor-patients');
  }

  async linkPatient(data: ILinkPatientRequest): Promise<EitherResponse<IDoctorPatientResponse>> {
    const response = await this.httpClient.post<EitherResponse<IDoctorPatientResponse>>(
      `${this.path}/link`,
      data,
    );

    return response.data;
  }

  async unlinkPatient(patientId: string): Promise<EitherResponse<void>> {
    const response = await this.httpClient.delete<EitherResponse<void>>(
      `${this.path}/unlink/${patientId}`,
    );

    return response.data;
  }

  async getMyPatients(): Promise<EitherResponse<IPatientListResponse[]>> {
    const response = await this.httpClient.get<EitherResponse<IPatientListResponse[]>>(
      `${this.path}/my-patients`,
    );

    return response.data;
  }

  async getMyDoctors(): Promise<EitherResponse<IDoctorListResponse[]>> {
    const response = await this.httpClient.get<EitherResponse<IDoctorListResponse[]>>(
      `${this.path}/my-doctors`,
    );

    return response.data;
  }
}
