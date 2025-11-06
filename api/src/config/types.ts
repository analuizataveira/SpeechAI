export type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT';

export type UserMetadata = {
  id: string;
  role: Role;
  name?: string;
  email?: string;
  createdAt?: Date;
};

export type RequestWithUser = Request & {
  user: UserMetadata;
};
