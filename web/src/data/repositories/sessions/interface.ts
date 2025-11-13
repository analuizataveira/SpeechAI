export interface ICreateSessionRequest {
  exerciseListId: string;
  startedAt: string;
}

export interface ISessionResponse {
  id: string;
  patientId: string;
  exerciseListId: string;
  score?: number;
  correctItems?: number;
  errorLog?: string;
  startedAt: Date;
  finishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpdateSessionRequest {
  score?: number;
  correctItems?: number;
  errorLog?: string;
  finishedAt?: string;
}
