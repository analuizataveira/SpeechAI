import { Test, TestingModule } from '@nestjs/testing';
import { DoctorPatientsController } from './doctor-patients.controller';
import { DoctorPatientsService } from './doctor-patients.service';
import { PrismaService } from '../../providers/database/prisma.provider';
import { JwtAuthGuard } from '../../framework/guards/jwt-auth.guard';
import { RolesGuard } from '../../framework/guards/roles.guard';
import { UnauthorizedException } from '@nestjs/common';

const mockService = {
  linkPatient: jest.fn(),
  unlinkPatient: jest.fn(),
  getMyPatients: jest.fn(),
  getAllDoctorsOfPatient: jest.fn(),
};

const mockPrisma = {
  user: { findUnique: jest.fn() },
};

describe('DoctorPatientsController', () => {
  let controller: DoctorPatientsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoctorPatientsController],
      providers: [
        { provide: DoctorPatientsService, useValue: mockService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DoctorPatientsController>(DoctorPatientsController);
  });

  it('deve vincular paciente se o usuário for MÉDICO', async () => {
    const req = { user: { id: 'user-doc' } };
    const dto = { patientId: 'pat-1' };

    mockPrisma.user.findUnique.mockResolvedValue({
      doctorProfile: { id: 'doc-profile-1' },
    });

    await controller.linkPatient(req as any, dto);

    expect(mockService.linkPatient).toHaveBeenCalledWith('doc-profile-1', dto);
  });

  it('deve buscar meus pacientes (getMyPatients)', async () => {
    const req = { user: { id: 'user-doc' } };
    mockPrisma.user.findUnique.mockResolvedValue({
      doctorProfile: { id: 'doc-profile-1' },
    });

    await controller.getMyPatients(req as any);

    expect(mockService.getMyPatients).toHaveBeenCalledWith('doc-profile-1');
  });

  it('deve lançar erro se tentar vincular sem ser médico', async () => {
    const req = { user: { id: 'user-pat' } };
    mockPrisma.user.findUnique.mockResolvedValue({
      doctorProfile: null,
    });

    await expect(controller.linkPatient(req as any, { patientId: '1' }))
      .rejects
      .toThrow(UnauthorizedException);
  });
});