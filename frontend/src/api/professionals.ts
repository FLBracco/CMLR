import { apiRequest } from "./client";
import type { IProfessional } from "../types/auth";

export interface IUpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  specialityCode?: string;
  licenseNumber?: string;
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

export const reportSubscriptionPayment = (): Promise<IProfessional> =>
  apiRequest<IProfessional>("/professionals/me/subscription/payment-report", {
    method: "POST",
  });
