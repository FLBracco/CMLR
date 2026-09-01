import { apiRequest } from "./client";
import type {
  IAdminAuthResponseDto,
  IAdminLoginPayload,
  IAdminProfessional,
} from "../types/admin";
import type { SubscriptionStatus } from "../types/auth";

export const adminLogin = (
  payload: IAdminLoginPayload
): Promise<IAdminAuthResponseDto> =>
  apiRequest<IAdminAuthResponseDto>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const adminLogout = (): Promise<void> =>
  apiRequest<void>("/admin/auth/logout", { method: "POST" });

export const listProfessionals = async (): Promise<IAdminProfessional[]> => {
  const { professionals } = await apiRequest<{
    professionals: IAdminProfessional[];
  }>("/admin/professionals");

  return professionals;
};

export const updateSubscriptionStatus = (
  id: string,
  status: SubscriptionStatus
): Promise<IAdminProfessional> =>
  apiRequest<IAdminProfessional>(`/admin/professionals/${id}/subscription`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
