import type { SubscriptionStatus } from "../../professionals/entities/subscription-status.js";

export interface IAdminProfessionalDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  speciality: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionUpdatedAt: string | null;
  createdAt: string;
}

export interface IAdminProfessionalListDto {
  professionals: IAdminProfessionalDto[];
}
