import { IsNotEmpty, IsString } from 'class-validator';

export class UnlinkPatientDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;
}
