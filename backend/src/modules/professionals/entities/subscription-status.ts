export const SUBSCRIPTION_STATUSES = [
  "PENDING",
  "PAYMENT_REPORTED",
  "ACTIVE",
  "DISABLED",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];
