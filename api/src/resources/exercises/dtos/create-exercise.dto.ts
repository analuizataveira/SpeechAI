import { IsNotEmpty, IsString } from 'class-validator';

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  diffTypeId: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}
