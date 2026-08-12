import { apiRequest } from "./client";
import type {
  IAuthResponseDto,
  ILoginPayload,
  IRegisterPayload,
  ISpecialityDto,
} from "../types/auth";

export const login = (payload: ILoginPayload): Promise<IAuthResponseDto> =>
  apiRequest<IAuthResponseDto>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const register = (
  payload: IRegisterPayload
): Promise<IAuthResponseDto> =>
  apiRequest<IAuthResponseDto>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const logout = (): Promise<void> =>
  apiRequest<void>("/auth/logout", { method: "POST" });

export const getSpecialities = async (): Promise<ISpecialityDto[]> => {
  const { specialities } = await apiRequest<{
    specialities: ISpecialityDto[];
  }>("/specialities");

  return specialities;
};
