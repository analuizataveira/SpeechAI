import { IsOptional, IsString, IsEmail, ValidateIf } from 'class-validator';

export class LinkPatientDto {
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.patientEmail)
  patientId?: string;

  @IsEmail()
  @IsOptional()
  @ValidateIf((o) => !o.patientId)
  patientEmail?: string;
}
