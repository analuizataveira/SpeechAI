import {
  Controller,
  Get,
  Param,
  Request,
  UseGuards,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../framework/guards/jwt-auth.guard';
import { RolesGuard } from '../../framework/guards/roles.guard';
import { Roles } from '../../framework/decorators/roles.decorator';
import { RequestWithUser } from '../../config/types';
import { PrismaService } from '../../providers/database/prisma.provider';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('patient/:patientId')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Get patient report data' })
  async getPatientReport(
    @Request() req: RequestWithUser,
    @Param('patientId') patientId: string,
  ) {
    // If patientId is 'me', use current user's patient profile
    let finalPatientId = patientId;
    if (patientId === 'me' && req.user.role === 'PATIENT') {
      const user = await this.prisma.user.findUnique({
        where: { id: req.user.id },
        include: { patientProfile: true },
      });

      if (!user?.patientProfile) {
        throw new UnauthorizedException('User is not a patient');
      }

      finalPatientId = user.patientProfile.id;
    }

    return this.reportsService.getPatientReportData(finalPatientId, req.user.id);
  }

  @Get('patient/:patientId/pdf')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Download patient report as PDF' })
  async getPatientReportPdf(
    @Request() req: RequestWithUser,
    @Param('patientId') patientId: string,
    @Res() res: Response,
  ) {
    // If patientId is 'me', use current user's patient profile
    let finalPatientId = patientId;
    if (patientId === 'me' && req.user.role === 'PATIENT') {
      const user = await this.prisma.user.findUnique({
        where: { id: req.user.id },
        include: { patientProfile: true },
      });

      if (!user?.patientProfile) {
        throw new UnauthorizedException('User is not a patient');
      }

      finalPatientId = user.patientProfile.id;
    }

    const pdfBuffer = await this.reportsService.generatePatientReportPdf(
      finalPatientId,
      req.user.id,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="relatorio-${finalPatientId}-${Date.now()}.pdf"`,
    );
    res.send(pdfBuffer);
  }
}

