import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDifficultyDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  diffTypeId: string;
}
