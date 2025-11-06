import { PrismaService } from '../../providers/database/prisma.provider';
import { ISessionsService } from './interfaces/sessions.service.interface';
import { CreateSessionDto } from './dtos/create-session.dto';
import { UpdateSessionDto } from './dtos/update-session.dto';
import { SessionResponseDto } from './dtos/session-response.dto';
export declare class SessionsService implements ISessionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(patientId: string, createSessionDto: CreateSessionDto): Promise<SessionResponseDto>;
    findAll(): Promise<SessionResponseDto[]>;
    findByPatient(patientId: string): Promise<SessionResponseDto[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateSessionDto: UpdateSessionDto): Promise<SessionResponseDto>;
    completeSession(id: string, data: UpdateSessionDto): Promise<SessionResponseDto>;
}
