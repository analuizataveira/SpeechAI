import { IsNotEmpty, IsString, IsArray, IsUUID } from 'class-validator';

export class CreateExerciseListDto {
  @IsString()
  @IsNotEmpty()
  diffTypeId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  difficultyLevel: string;

  @IsArray()
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  exerciseIds: string[];
}
