import type { SubscriptionStatus } from "../../professionals/entities/subscription-status.js";

export interface IAuthResponseDto {
  token: string;
  professional: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    speciality: string;
    subscriptionStatus: SubscriptionStatus;
  };
}
