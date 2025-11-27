export interface IReportData {
  patientName: string;
  patientAge: number;
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  totalWordsPracticed: number;
  improvementPercentage: number;
  recentSessions: Array<{
    id: string;
    score?: number;
    correctItems?: number;
    startedAt: Date;
    finishedAt?: Date;
    exerciseListTitle?: string;
  }>;
  sessionsByWeek: Array<{
    week: string;
    averageScore: number;
    sessionCount: number;
  }>;
  generatedAt: Date;
}

