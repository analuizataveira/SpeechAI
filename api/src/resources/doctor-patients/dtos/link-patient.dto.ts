import { IsNotEmpty, IsString } from 'class-validator';

export class LinkPatientDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;
}
