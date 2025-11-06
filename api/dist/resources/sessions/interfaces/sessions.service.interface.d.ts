import { CreateSessionDto } from '../dtos/create-session.dto';
import { UpdateSessionDto } from '../dtos/update-session.dto';
import { SessionResponseDto } from '../dtos/session-response.dto';
export interface ISessionsService {
    create(patientId: string, createSessionDto: CreateSessionDto): Promise<SessionResponseDto>;
    findAll(): Promise<SessionResponseDto[]>;
    findByPatient(patientId: string): Promise<SessionResponseDto[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateSessionDto: UpdateSessionDto): Promise<SessionResponseDto>;
}
