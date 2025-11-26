import { ReportDataDto } from '../dtos/report-data.dto';

export interface IReportsService {
  getPatientReportData(patientId: string, userId: string): Promise<ReportDataDto>;
  generatePatientReportPdf(patientId: string, userId: string): Promise<Buffer>;
}

