import type { Request, Response } from "express";
import { ProfessionalSpecialityRepository } from "../repositories/professional-speciality.repository.js";

export class ProfessionalSpecialityController {
  constructor(
    private readonly repository = new ProfessionalSpecialityRepository()
  ) {}

  async list(_req: Request, res: Response): Promise<void> {
    const specialities = await this.repository.findAll();

    res.status(200).json({
      specialities: specialities.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
      })),
    });
  }
}
