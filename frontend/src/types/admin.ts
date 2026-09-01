import type { SubscriptionStatus } from "./auth";

export interface IAdmin {
  id: string;
  email: string;
}

export interface IAdminAuthResponseDto {
  token: string;
  admin: IAdmin;
}

export interface IAdminLoginPayload {
  email: string;
  password: string;
}

export interface IAdminProfessional {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  speciality: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionUpdatedAt: string | null;
  createdAt: string;
}
