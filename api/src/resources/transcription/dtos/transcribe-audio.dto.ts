import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class TranscribeAudioDto {
  @ApiProperty({
    description: 'Target word to compare pronunciation',
    example: 'hello',
  })
  @IsString()
  @IsNotEmpty()
  targetWord: string;
}

