import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { verifyToken } from "../../modules/auth/services/token.service.js";

export interface IAuthenticatedRequest extends Request {
  auth?: {
    professionalId: string;
    email: string;
  };
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    next(AppError.unauthorized("Se requiere un token de acceso."));
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyToken(token);
    (req as IAuthenticatedRequest).auth = {
      professionalId: payload.sub,
      email: payload.email,
    };
    next();
  } catch {
    next(AppError.unauthorized("Token inválido o expirado."));
  }
};
