import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  exerciseListId: string;

  @IsDateString()
  @IsNotEmpty()
  startedAt: string;
}
