export interface IUser {
  id: string;
  email: string;
  role: string;
  name: string;
  birthDate: Date;
  phone: string;
  specialty?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUserRequest {
  email: string;
  password: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  name: string;
  birthDate: string; // ISO date string
  phone: string;
  specialty?: string;
}