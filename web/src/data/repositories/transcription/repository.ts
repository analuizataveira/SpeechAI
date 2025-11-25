import { EitherResponse } from '@/domain/types/http';
import { BaseRepository } from '../base';

export interface ITranscriptionResponse {
  score: number;
  transcribedText?: string;
  feedback?: string;
}

export class TranscriptionRepository extends BaseRepository {
  constructor() {
    super('transcription');
  }

  async transcribeAudio(
    audioFile: Blob,
    targetWord: string,
  ): Promise<EitherResponse<ITranscriptionResponse>> {
    const formData = new FormData();
    formData.append('audio', audioFile, 'audio.webm');
    formData.append('targetWord', targetWord);

    const response = await this.httpClient.post<EitherResponse<ITranscriptionResponse>>(
      `${this.path}/transcribe`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data;
  }
}

