export interface IProfessional {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  speciality: string;
}

export interface IAuthResponseDto {
  token: string;
  professional: IProfessional;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  specialityCode: string;
}

export interface ISpecialityDto {
  id: string;
  code: string;
  name: string;
}
