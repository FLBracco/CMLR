export interface IAdminAuthResponseDto {
  token: string;
  admin: {
    id: string;
    email: string;
  };
}
