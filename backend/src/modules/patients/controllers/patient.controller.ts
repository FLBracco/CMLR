import type { Response } from "express";
import { PatientService } from "../services/patient.service.js";
import type { IAuthenticatedRequest } from "../../../shared/middlewares/authenticate.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class PatientController {
  constructor(private readonly patientService = new PatientService()) {}

  async create(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const professionalId = this.getProfessionalId(req);

    const result = await this.patientService.create(professionalId, req.body);
    res.status(201).json(result);
  }

  async list(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;

    const result = await this.patientService.list(professionalId, search);
    res.status(200).json(result);
  }

  async getById(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const result = await this.patientService.getById(
      professionalId,
      req.params.id as string
    );
    res.status(200).json(result);
  }

  async update(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const result = await this.patientService.update(
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
