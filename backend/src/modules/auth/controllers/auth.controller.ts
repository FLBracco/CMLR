import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  async register(req: Request, res: Response): Promise<void> {
    const result = await this.authService.register(req.body);
    res.status(201).json(result);
  }

  async login(req: Request, res: Response): Promise<void> {
    const result = await this.authService.login(req.body);
    res.status(200).json(result);
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.status(204).send();
  }
}
