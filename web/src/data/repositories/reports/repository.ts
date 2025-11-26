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

    // For blob responses, the interceptor returns the axios response directly
    // so response.data should be the Blob
    const blob = response.data;
    
    if (!(blob instanceof Blob)) {
      console.error('Response is not a Blob:', blob);
      throw new Error('Failed to retrieve PDF blob from response');
    }
    
    return blob;
  }
}

