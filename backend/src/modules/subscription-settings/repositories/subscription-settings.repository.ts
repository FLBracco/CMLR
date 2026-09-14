import { AppDataSource } from "../../../config/db/data-source.js";
import {
  SUBSCRIPTION_SETTINGS_ID,
  SubscriptionSettings,
} from "../entities/subscription-settings.entity.js";
import type { DeepPartial } from "typeorm";

export class SubscriptionSettingsRepository {
  private readonly repository = AppDataSource.getRepository(SubscriptionSettings);

  async get(): Promise<SubscriptionSettings | null> {
    return this.repository.findOneBy({ id: SUBSCRIPTION_SETTINGS_ID });
  }

  async update(
    settings: SubscriptionSettings,
    data: DeepPartial<SubscriptionSettings>
  ): Promise<SubscriptionSettings> {
    this.repository.merge(settings, data);
    return this.repository.save(settings);
  }
}
