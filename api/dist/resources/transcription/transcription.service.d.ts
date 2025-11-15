import { ConfigService } from '@nestjs/config';
import { ITranscriptionService } from './interfaces/transcription.service.interface';
import { TranscriptionResponseDto } from './dtos/transcription-response.dto';
export declare class TranscriptionService implements ITranscriptionService {
    private readonly configService;
    private readonly n8nWebhookUrl;
    constructor(configService: ConfigService);
    transcribeAudio(audioFile: any, targetWord: string): Promise<TranscriptionResponseDto>;
}
