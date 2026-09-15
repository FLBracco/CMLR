import type { Response } from "express";
import { ProfessionalService } from "../services/professional.service.js";
import type { IAuthenticatedRequest } from "../../../shared/middlewares/authenticate.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class ProfessionalController {
  constructor(
    private readonly professionalService = new ProfessionalService()
  ) {}

  async getMe(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const result = await this.professionalService.getById(professionalId);
    res.status(200).json(result);
  }

  async updateMe(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const result = await this.professionalService.updateProfile(
      professionalId,
      req.body
    );
    res.status(200).json(result);
  }

  async reportSubscriptionPayment(
    req: IAuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const result = await this.professionalService.reportSubscriptionPayment(
      professionalId
    );
    res.status(200).json(result);
  }

  private getProfessionalId(req: IAuthenticatedRequest): string {
    if (!req.auth?.professionalId) {
      throw AppError.unauthorized("Token inválido.");
    }
    return req.auth.professionalId;
  }
}
