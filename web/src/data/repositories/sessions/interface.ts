export interface ICreateSessionRequest {
  exerciseListId: string;
  startedAt: string;
}

export interface IExerciseListItem {
  id: string;
  exerciseId: string;
  exerciseListId: string;
  order?: number;
  exercise?: {
    id: string;
    text: string;
    diffTypeId: string;
  };
}

export interface IExerciseList {
  id: string;
  doctorId: string;
  diffTypeId: string;
  title: string;
  difficultyLevel: string;
  diffType?: {
    id: string;
    description: string;
  };
  items?: IExerciseListItem[];
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
  exerciseList?: IExerciseList;
}

export interface IUpdateSessionRequest {
  score?: number;
  correctItems?: number;
  errorLog?: string;
  finishedAt?: string;
}
