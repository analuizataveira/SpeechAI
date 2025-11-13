export interface ICreateExerciseRequest {
  diffTypeId: string;
  text: string;
}

export interface IExerciseResponse {
  id: string;
  diffTypeId: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  diffType?: {
    id: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

