import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dtos/create-session.dto';
import { UpdateSessionDto } from './dtos/update-session.dto';
import { RequestWithUser } from '../../config/types';
import { PrismaService } from '../../providers/database/prisma.provider';
export declare class SessionsController {
    private readonly sessionsService;
    private readonly prisma;
    constructor(sessionsService: SessionsService, prisma: PrismaService);
    create(req: RequestWithUser, createSessionDto: CreateSessionDto): Promise<import("./dtos/session-response.dto").SessionResponseDto>;
    findAll(): Promise<import("./dtos/session-response.dto").SessionResponseDto[]>;
    findMySessions(req: RequestWithUser): Promise<import("./dtos/session-response.dto").SessionResponseDto[]>;
    findByPatient(patientId: string): Promise<import("./dtos/session-response.dto").SessionResponseDto[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateSessionDto: UpdateSessionDto): Promise<import("./dtos/session-response.dto").SessionResponseDto>;
    completeSession(id: string, data: UpdateSessionDto): Promise<import("./dtos/session-response.dto").SessionResponseDto>;
}
