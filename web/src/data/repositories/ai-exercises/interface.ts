export interface IGenerateExercisesRequest {
  patientId?: string;
}

export interface IGenerateExercisesResponse {
  exercises: string[];
  diffTypeId?: string;
}

