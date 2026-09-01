import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { verifyToken } from "../../modules/auth/services/token.service.js";

export interface IAdminAuthenticatedRequest extends Request {
  adminAuth?: {
    adminId: string;
    email: string;
  };
}

export const authenticateAdmin = (
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

    if (payload.role !== "superadmin") {
      next(AppError.unauthorized("Token inválido o expirado."));
      return;
    }

    (req as IAdminAuthenticatedRequest).adminAuth = {
      adminId: payload.sub,
      email: payload.email,
    };
    next();
  } catch {
    next(AppError.unauthorized("Token inválido o expirado."));
  }
};
