export interface ICreateDiffTypeRequest {
  description: string;
}

export interface IUpdateDiffTypeRequest {
  description?: string;
}

export interface IDiffTypeResponse {
  id: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

