export interface ICreateExerciseListRequest {
  diffTypeId: string;
  title: string;
  difficultyLevel: string;
  exerciseIds: string[];
}

export interface IExerciseListItem {
  id: string;
  exerciseId: string;
  exerciseListId: string;
  order?: number;
  exercise?: {
    id: string;
    diffTypeId: string;
    text: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface IExerciseListResponse {
  id: string;
  doctorId: string;
  diffTypeId: string;
  title: string;
  difficultyLevel: string;
  createdAt: Date;
  updatedAt: Date;
  items?: IExerciseListItem[];
  diffType?: {
    id: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  };
  doctor?: {
    id: string;
    userId: string;
    name: string;
    birthDate: Date;
    phone: string;
    specialty: string;
    createdAt: Date;
    updatedAt: Date;
    user?: {
      id: string;
      email: string;
      role: string;
      createdAt: Date;
      updatedAt: Date;
    };
  };
}

