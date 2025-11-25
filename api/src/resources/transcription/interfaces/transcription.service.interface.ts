import { TranscribeAudioDto } from '../dtos/transcribe-audio.dto';
import { TranscriptionResponseDto } from '../dtos/transcription-response.dto';

export interface ITranscriptionService {
  transcribeAudio(
    audioFile: any,
    targetWord: string,
  ): Promise<TranscriptionResponseDto>;
}

