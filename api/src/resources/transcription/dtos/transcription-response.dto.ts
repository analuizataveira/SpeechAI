import { ApiProperty } from '@nestjs/swagger';

export class TranscriptionResponseDto {
  @ApiProperty({
    description: 'Score from 0 to 100',
    example: 85,
  })
  score: number;

  @ApiProperty({
    description: 'Transcribed text from audio',
    example: 'hello',
    required: false,
  })
  transcribedText?: string;

  @ApiProperty({
    description: 'Feedback message',
    example: 'Good pronunciation!',
    required: false,
  })
  feedback?: string;
}

