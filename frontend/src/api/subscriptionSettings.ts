import { apiRequest } from "./client";
import type {
  ISubscriptionSettings,
  IUpdateSubscriptionSettingsPayload,
} from "../types/subscriptionSettings";

export const getSubscriptionSettings = (): Promise<ISubscriptionSettings> =>
  apiRequest<ISubscriptionSettings>("/subscription-settings");

export const getAdminSubscriptionSettings = (): Promise<ISubscriptionSettings> =>
  apiRequest<ISubscriptionSettings>("/admin/subscription-settings");

export const updateAdminSubscriptionSettings = (
  payload: IUpdateSubscriptionSettingsPayload
): Promise<ISubscriptionSettings> =>
  apiRequest<ISubscriptionSettings>("/admin/subscription-settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
