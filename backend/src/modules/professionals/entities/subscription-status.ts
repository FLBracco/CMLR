export const SUBSCRIPTION_STATUSES = ["PENDING", "ACTIVE", "DISABLED"] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];
