export class SessionSummaryDto {
  id: string;
  score?: number;
  correctItems?: number;
  startedAt: Date;
  finishedAt?: Date;
  exerciseListTitle?: string;
}

export class ReportDataDto {
  patientName: string;
  patientAge: number;
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  totalWordsPracticed: number;
  improvementPercentage: number;
  recentSessions: SessionSummaryDto[];
  sessionsByWeek: Array<{
    week: string;
    averageScore: number;
    sessionCount: number;
  }>;
  generatedAt: Date;
}

