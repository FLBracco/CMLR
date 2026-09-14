import type { Request, Response } from "express";
import { SubscriptionSettingsService } from "../services/subscription-settings.service.js";
import type { UpdateSubscriptionSettingsDto } from "../dto/update-subscription-settings.dto.js";

export class SubscriptionSettingsController {
  constructor(
    private readonly subscriptionSettingsService = new SubscriptionSettingsService()
  ) {}

  async get(_req: Request, res: Response): Promise<void> {
    const result = await this.subscriptionSettingsService.get();
    res.status(200).json(result);
  }

  async update(
    req: Request & { body: UpdateSubscriptionSettingsDto },
    res: Response
  ): Promise<void> {
    const result = await this.subscriptionSettingsService.update(req.body);
    res.status(200).json(result);
  }
}
