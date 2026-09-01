import type { Request, Response } from "express";
import { AdminAuthService } from "../services/admin-auth.service.js";

export class AdminAuthController {
  constructor(private readonly adminAuthService = new AdminAuthService()) {}

  async login(req: Request, res: Response): Promise<void> {
    const result = await this.adminAuthService.login(req.body);
    res.status(200).json(result);
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.status(204).send();
  }
}
