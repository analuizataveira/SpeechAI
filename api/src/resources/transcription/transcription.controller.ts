import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { TranscriptionService } from './transcription.service';
import { TranscribeAudioDto } from './dtos/transcribe-audio.dto';
import { TranscriptionResponseDto } from './dtos/transcription-response.dto';
import { JwtAuthGuard } from '../../framework/guards/jwt-auth.guard';

@ApiTags('Transcription')
@Controller('transcription')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TranscriptionController {
  constructor(private readonly transcriptionService: TranscriptionService) {}

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('audio'))
  @ApiOperation({ summary: 'Transcribe audio and get pronunciation score' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audio: {
          type: 'string',
          format: 'binary',
          description: 'Audio file (webm, wav, mp3, etc.)',
        },
        targetWord: {
          type: 'string',
          description: 'Target word to compare pronunciation',
          example: 'hello',
        },
      },
      required: ['audio', 'targetWord'],
    },
  })
  async transcribe(
    @UploadedFile() audioFile: any,
    @Body() transcribeDto: TranscribeAudioDto,
  ): Promise<TranscriptionResponseDto> {
    return this.transcriptionService.transcribeAudio(
      audioFile,
      transcribeDto.targetWord,
    );
  }
}

