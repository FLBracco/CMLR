export interface ISubscriptionSettings {
  monthlyAmount: number | null;
  alias: string | null;
  cbu: string | null;
  accountHolderName: string | null;
  whatsappNumber: string | null;
  updatedAt: string;
}

export interface IUpdateSubscriptionSettingsPayload {
  monthlyAmount?: number;
  alias?: string;
  cbu?: string;
  accountHolderName?: string;
  whatsappNumber?: string;
}
