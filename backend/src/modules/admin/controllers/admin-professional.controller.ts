import type { Response } from "express";
import { AdminProfessionalService } from "../services/admin-professional.service.js";
import type { IAdminAuthenticatedRequest } from "../../../shared/middlewares/authenticate-admin.js";
import type { UpdateSubscriptionStatusDto } from "../dto/update-subscription-status.dto.js";

export class AdminProfessionalController {
  constructor(
    private readonly adminProfessionalService = new AdminProfessionalService()
  ) {}

  async list(
    _req: IAdminAuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const result = await this.adminProfessionalService.list();
    res.status(200).json(result);
  }

  async updateSubscription(
    req: IAdminAuthenticatedRequest & { body: UpdateSubscriptionStatusDto },
    res: Response
  ): Promise<void> {
    const result = await this.adminProfessionalService.updateSubscriptionStatus(
      req.params.id as string,
      req.body.status
    );
    res.status(200).json(result);
  }
}
