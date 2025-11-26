import { EitherResponse } from '@/domain/types/http';
import { BaseRepository } from '../base';
import { IReportData } from './interface';

export class ReportsRepository extends BaseRepository {
  constructor() {
    super('reports');
  }

  async getPatientReport(
    patientId: string = 'me',
  ): Promise<EitherResponse<IReportData>> {
    const response = await this.httpClient.get<EitherResponse<IReportData>>(
      `${this.path}/patient/${patientId}`,
    );

    return response.data;
  }

  async downloadPatientReportPdf(patientId: string = 'me'): Promise<Blob> {
    const response = await this.httpClient.get(
      `${this.path}/patient/${patientId}/pdf`,
      {
        responseType: 'blob',
      },
    );

    return response.data;
  }
}

