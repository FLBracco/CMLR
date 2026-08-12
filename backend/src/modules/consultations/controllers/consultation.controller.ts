import type { Response } from "express";
import { ConsultationService } from "../services/consultation.service.js";
import type { IAuthenticatedRequest } from "../../../shared/middlewares/authenticate.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class ConsultationController {
  constructor(
    private readonly consultationService = new ConsultationService()
  ) {}

  async create(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const result = await this.consultationService.create(
      professionalId,
      req.params.patientId as string,
      req.body
    );
    res.status(201).json(result);
  }

  async listByPatient(
    req: IAuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const result = await this.consultationService.listByPatient(
      professionalId,
      req.params.patientId as string
    );
    res.status(200).json(result);
  }

  async update(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const result = await this.consultationService.update(
      professionalId,
      req.params.id as string,
      req.body
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
