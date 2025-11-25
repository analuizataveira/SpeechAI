import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';
import { ITranscriptionService } from './interfaces/transcription.service.interface';
import { TranscriptionResponseDto } from './dtos/transcription-response.dto';

@Injectable()
export class TranscriptionService implements ITranscriptionService {
  private readonly n8nWebhookUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.n8nWebhookUrl =
      this.configService.get<string>('N8N_WEBHOOK_URL') ||
      'https://testessss.app.n8n.cloud/webhook/audio-to-transcribe';
  }

  async transcribeAudio(
    audioFile: any,
    targetWord: string,
  ): Promise<TranscriptionResponseDto> {
    if (!audioFile) {
      throw new BadRequestException('Audio file is required');
    }

    try {
      // Create form data to send to n8n webhook
      const formData = new FormData();
      formData.append('audio', audioFile.buffer, {
        filename: audioFile.originalname || 'audio.webm',
        contentType: audioFile.mimetype || 'audio/webm',
      });
      formData.append('targetWord', targetWord);

      // Call n8n webhook
      const response = await axios.post(this.n8nWebhookUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000, // 30 seconds timeout
      });

      // Parse response from n8n
      const responseData = response.data;
      console.log('📥 Raw response from n8n webhook:', JSON.stringify(responseData, null, 2));

      // Handle different response formats
      if (typeof responseData === 'number') {
        return {
          score: responseData,
        };
      }

      if (typeof responseData === 'object') {
        // Extract score - handle "pontuacao" field (can be string or number)
        let score = 0;
        
        if (responseData.pontuacao !== undefined) {
          // Handle "pontuacao": "100%" or "pontuacao": "100" or "pontuacao": 100
          if (typeof responseData.pontuacao === 'string') {
            // Remove % sign and parse
            score = parseFloat(responseData.pontuacao.replace('%', '').trim()) || 0;
          } else {
            score = responseData.pontuacao;
          }
        } else if (responseData.score !== undefined) {
          score = typeof responseData.score === 'string' 
            ? parseFloat(responseData.score.replace('%', '')) || 0
            : responseData.score;
        } else if (responseData.note !== undefined) {
          score = typeof responseData.note === 'string'
            ? parseFloat(responseData.note.replace('%', '')) || 0
            : responseData.note;
        } else if (responseData.grade !== undefined) {
          score = typeof responseData.grade === 'string'
            ? parseFloat(responseData.grade.replace('%', '')) || 0
            : responseData.grade;
        }

        // Ensure score is between 0 and 100
        score = Math.max(0, Math.min(100, score));

        // Extract feedback/analysis - handle "analise" field
        const feedback = responseData.analise 
          ?? responseData.feedback 
          ?? responseData.message 
          ?? responseData.analysis
          ?? '';

        // Extract transcribed text
        const transcribedText = responseData.transcribedText 
          ?? responseData.text 
          ?? responseData.transcricao
          ?? '';

        const result = {
          score: Math.round(score),
          transcribedText,
          feedback: feedback.trim(),
        };
        
        console.log('✅ Processed transcription result:', JSON.stringify(result, null, 2));
        return result;
      }

      // Fallback: try to extract score from any format
      return {
        score: 0,
        feedback: 'Unable to parse response from transcription service',
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Transcription service error: ${error.message}`,
        );
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException(
        `Failed to transcribe audio: ${errorMessage}`,
      );
    }
  }
}

