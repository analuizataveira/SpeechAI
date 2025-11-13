export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface ILoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface IMeResponse {
  id: string;
  email: string;
  role: string;
  doctorProfile?: {
    id: string;
    name: string;
    birthDate: Date;
    phone: string;
    specialty: string;
  };
  patientProfile?: {
    id: string;
    name: string;
    birthDate: Date;
    phone: string;
  };
}

export interface ILogoutResponse {
  success: boolean;
  message: string;
}

