export interface IPatient {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  phone: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IPatientPayload {
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  phone: string;
  email?: string;
}
