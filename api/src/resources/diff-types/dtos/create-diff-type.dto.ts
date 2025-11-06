import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDiffTypeDto {
  @IsString()
  @IsNotEmpty()
  description: string;
}
