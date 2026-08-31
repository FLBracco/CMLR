import { apiRequest } from "./client";
import type { IProfessional } from "../types/auth";

export interface IUpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  specialityCode?: string;
}

export const getMyProfile = (): Promise<IProfessional> =>
  apiRequest<IProfessional>("/professionals/me");

export const updateMyProfile = (
  payload: IUpdateProfilePayload
): Promise<IProfessional> =>
  apiRequest<IProfessional>("/professionals/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
