import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma.provider';
import { IReportsService } from './interfaces/reports.service.interface';
import { ReportDataDto, SessionSummaryDto } from './dtos/report-data.dto';
const PDFDocument = require('pdfkit');

@Injectable()
export class ReportsService implements IReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPatientReportData(
    patientId: string,
    userId: string,
  ): Promise<ReportDataDto> {
    // Verify patient exists
    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: {
        user: true,
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Verify access
    await this.verifyAccess(patientId, userId);

    // Get all sessions
    const sessions = await this.prisma.session.findMany({
      where: { patientId },
      include: {
        exerciseList: {
          include: {
            diffType: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    const completedSessions = sessions.filter((s) => s.finishedAt);
    const totalSessions = sessions.length;

    // Calculate statistics
    const averageScore =
      completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) /
          completedSessions.length
        : 0;

    const totalWordsPracticed = completedSessions.reduce(
      (sum, s) => sum + (s.correctItems || 0),
      0,
    );

    // Calculate improvement (last 7 days vs previous 7 days)
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentSessions = completedSessions.filter(
      (s) => s.finishedAt && new Date(s.finishedAt) >= lastWeek,
    );
    const previousSessions = completedSessions.filter((s) => {
      if (!s.finishedAt) return false;
      const finished = new Date(s.finishedAt);
      return finished >= twoWeeksAgo && finished < lastWeek;
    });

    const recentAvg =
      recentSessions.length > 0
        ? recentSessions.reduce((sum, s) => sum + (s.score || 0), 0) /
          recentSessions.length
        : 0;
    const previousAvg =
      previousSessions.length > 0
        ? previousSessions.reduce((sum, s) => sum + (s.score || 0), 0) /
          previousSessions.length
        : 0;

    const improvementPercentage =
      previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

    // Calculate age
    const birthDate = new Date(patient.birthDate);
    const age = now.getFullYear() - birthDate.getFullYear();
    const monthDiff = now.getMonth() - birthDate.getMonth();
    const patientAge =
      monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())
        ? age - 1
        : age;

    // Group sessions by week
    const sessionsByWeekMap = new Map<string, { scores: number[]; count: number }>();

    completedSessions.forEach((session) => {
      if (!session.finishedAt) return;
      const finished = new Date(session.finishedAt);
      const weekStart = new Date(finished);
      weekStart.setDate(finished.getDate() - finished.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!sessionsByWeekMap.has(weekKey)) {
        sessionsByWeekMap.set(weekKey, { scores: [], count: 0 });
      }
      const weekData = sessionsByWeekMap.get(weekKey)!;
      if (session.score !== null && session.score !== undefined) {
        weekData.scores.push(session.score);
      }
      weekData.count++;
    });

    const sessionsByWeek = Array.from(sessionsByWeekMap.entries())
      .map(([week, data]) => ({
        week,
        averageScore:
          data.scores.length > 0
            ? data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length
            : 0,
        sessionCount: data.count,
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8); // Last 8 weeks

    // Recent sessions (last 10)
    const recentSessionsSummary: SessionSummaryDto[] = completedSessions
      .slice(0, 10)
      .map((s) => ({
        id: s.id,
        score: s.score || undefined,
        correctItems: s.correctItems || undefined,
        startedAt: s.startedAt,
        finishedAt: s.finishedAt || undefined,
        exerciseListTitle: s.exerciseList?.title,
      }));

    return {
      patientName: patient.name,
      patientAge,
      totalSessions,
      completedSessions: completedSessions.length,
      averageScore: Math.round(averageScore * 100) / 100,
      totalWordsPracticed,
      improvementPercentage: Math.round(improvementPercentage * 100) / 100,
      recentSessions: recentSessionsSummary,
      sessionsByWeek,
      generatedAt: new Date(),
    };
  }

  async generatePatientReportPdf(
    patientId: string,
    userId: string,
  ): Promise<Buffer> {
    const reportData = await this.getPatientReportData(patientId, userId);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Relatório de Progresso', { align: 'center' })
        .moveDown();

      doc
        .fontSize(12)
        .font('Helvetica')
        .text(`Paciente: ${reportData.patientName}`, { align: 'left' })
        .text(`Idade: ${reportData.patientAge} anos`, { align: 'left' })
        .text(
          `Data do Relatório: ${reportData.generatedAt.toLocaleDateString('pt-BR')}`,
          { align: 'left' },
        )
        .moveDown();

      // Statistics Section
      doc.fontSize(16).font('Helvetica-Bold').text('Estatísticas Gerais').moveDown();
      doc.fontSize(12).font('Helvetica');

      doc.text(`Total de Sessões: ${reportData.totalSessions}`);
      doc.text(`Sessões Completas: ${reportData.completedSessions}`);
      doc.text(`Pontuação Média: ${reportData.averageScore.toFixed(1)}%`);
      doc.text(`Total de Palavras Praticadas: ${reportData.totalWordsPracticed}`);
      doc.text(
        `Melhoria: ${reportData.improvementPercentage >= 0 ? '+' : ''}${reportData.improvementPercentage.toFixed(1)}%`,
      );
      doc.moveDown();

      // Progress by Week
      if (reportData.sessionsByWeek.length > 0) {
        doc.fontSize(16).font('Helvetica-Bold').text('Evolução Semanal').moveDown();
        doc.fontSize(12).font('Helvetica');

        reportData.sessionsByWeek.forEach((week) => {
          const weekDate = new Date(week.week);
          doc.text(
            `${weekDate.toLocaleDateString('pt-BR')}: ${week.averageScore.toFixed(1)}% (${week.sessionCount} sessões)`,
          );
        });
        doc.moveDown();
      }

      // Recent Sessions
      if (reportData.recentSessions.length > 0) {
        doc.fontSize(16).font('Helvetica-Bold').text('Sessões Recentes').moveDown();
        doc.fontSize(12).font('Helvetica');

        reportData.recentSessions.forEach((session) => {
          const date = new Date(session.finishedAt || session.startedAt);
          doc.text(
            `${date.toLocaleDateString('pt-BR')} - ${session.exerciseListTitle || 'Sessão'}: ${session.score?.toFixed(1) || 'N/A'}%`,
          );
        });
      }

      // Footer
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(
          `Relatório gerado automaticamente pelo SpeechAI em ${reportData.generatedAt.toLocaleString('pt-BR')}`,
          { align: 'center' },
        );

      doc.end();
    });
  }

  private async verifyAccess(patientId: string, userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        patientProfile: true,
        doctorProfile: {
          include: {
            patientDoctors: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Patient can only access their own reports
    if (user.role === 'PATIENT') {
      if (user.patientProfile?.id !== patientId) {
        throw new UnauthorizedException(
          'Patients can only access their own reports',
        );
      }
    } else if (user.role === 'DOCTOR') {
      // Doctor can only access reports of their patients
      const hasAccess = user.doctorProfile?.patientDoctors.some(
        (pd) => pd.patientId === patientId && pd.active,
      );
      if (!hasAccess) {
        throw new UnauthorizedException(
          'Doctor does not have access to this patient',
        );
      }
    } else if (user.role !== 'ADMIN') {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}

