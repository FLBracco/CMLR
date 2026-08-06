export interface IAuthResponseDto {
  token: string;
  professional: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    speciality: string;
  };
}
