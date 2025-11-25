export interface ICreateDifficultyRequest {
  patientId: string;
  diffTypeId: string;
}

export interface IDifficultyResponse {
  id: string;
  patientId: string;
  diffTypeId: string;
  createdAt: Date;
  updatedAt: Date;
  diffType?: {
    id: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

