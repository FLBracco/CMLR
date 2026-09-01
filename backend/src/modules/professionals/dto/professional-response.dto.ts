import type { SubscriptionStatus } from "../entities/subscription-status.js";

export interface IProfessionalDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  speciality: string;
  subscriptionStatus: SubscriptionStatus;
}
