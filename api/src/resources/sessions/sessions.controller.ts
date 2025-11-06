import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dtos/create-session.dto';
import { UpdateSessionDto } from './dtos/update-session.dto';
import { JwtAuthGuard } from '../../framework/guards/jwt-auth.guard';
import { RolesGuard } from '../../framework/guards/roles.guard';
import { Roles } from '../../framework/decorators/roles.decorator';
import { RequestWithUser } from '../../config/types';
import { PrismaService } from '../../providers/database/prisma.provider';
import { UnauthorizedException } from '@nestjs/common';
import { Public } from '../../framework/decorators/public.decorator';

@ApiTags('Sessions')
@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles('PATIENT')
  @ApiOperation({ summary: 'Create a session' })
  async create(
    @Request() req: RequestWithUser,
    @Body() createSessionDto: CreateSessionDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: { patientProfile: true },
    });
    if (!user?.patientProfile) {
      throw new UnauthorizedException('User is not a patient');
    }
    return this.sessionsService.create(
      user.patientProfile.id,
      createSessionDto,
    );
  }

  @Get()
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Get all sessions' })
  findAll() {
    return this.sessionsService.findAll();
  }

  @Get('my-sessions')
  @Roles('PATIENT')
  @ApiOperation({ summary: 'Get my sessions' })
  async findMySessions(@Request() req: RequestWithUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: { patientProfile: true },
    });
    if (!user?.patientProfile) {
      throw new UnauthorizedException('User is not a patient');
    }
    return this.sessionsService.findByPatient(user.patientProfile.id);
  }

  @Get('patient/:patientId')
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Get sessions for a patient' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.sessionsService.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a session by id' })
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Patch(':id')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Update a session' })
  update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
    return this.sessionsService.update(id, updateSessionDto);
  }

  // Webhook endpoint for n8n to complete sessions
  @Post('webhook/complete/:id')
  @Public()
  @ApiOperation({ summary: 'Webhook for n8n to complete sessions' })
  async completeSession(
    @Param('id') id: string,
    @Body() data: UpdateSessionDto,
  ) {
    return this.sessionsService.completeSession(id, data);
  }
}
