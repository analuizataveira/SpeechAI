import { IsOptional, IsNumber, IsDateString, IsString } from 'class-validator';

export class UpdateSessionDto {
  @IsNumber()
  @IsOptional()
  score?: number;

  @IsNumber()
  @IsOptional()
  correctItems?: number;

  @IsString()
  @IsOptional()
  errorLog?: string;

  @IsDateString()
  @IsOptional()
  finishedAt?: string;
}
