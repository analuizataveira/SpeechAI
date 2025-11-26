import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GenerateExercisesDto {
  @ApiProperty({
    description: 'Patient ID (optional, will use current user if not provided)',
    required: false,
  })
  @IsOptional()
  @IsString()
  patientId?: string;
}

export class GenerateExercisesResponseDto {
  @ApiProperty({
    description: 'Generated exercises',
    example: ['rato', 'carro', 'porta', 'casa'],
  })
  exercises: string[];

  @ApiProperty({
    description: 'Difficulty type ID used for generation',
  })
  diffTypeId?: string;
}

