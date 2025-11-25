import { TranscriptionService } from './transcription.service';
import { TranscribeAudioDto } from './dtos/transcribe-audio.dto';
import { TranscriptionResponseDto } from './dtos/transcription-response.dto';
export declare class TranscriptionController {
    private readonly transcriptionService;
    constructor(transcriptionService: TranscriptionService);
    transcribe(audioFile: any, transcribeDto: TranscribeAudioDto): Promise<TranscriptionResponseDto>;
}
