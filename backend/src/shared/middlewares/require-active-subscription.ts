import type { NextFunction, Response } from "express";
import { AppError } from "../errors/AppError.js";
import type { IAuthenticatedRequest } from "./authenticate.js";
import { ProfessionalRepository } from "../../modules/professionals/repositories/professional.repository.js";
import type { SubscriptionStatus } from "../../modules/professionals/entities/subscription-status.js";

const SUBSCRIPTION_BLOCKED_MESSAGES: Partial<Record<SubscriptionStatus, string>> = {
  PENDING: "Tu cuenta está pendiente de activación.",
  DISABLED: "Tu suscripción está desactivada. Contactá al administrador.",
};

export interface IRequireActiveSubscriptionOptions {
  allow?: SubscriptionStatus[];
}

export const requireActiveSubscription = (
  options: IRequireActiveSubscriptionOptions = {},
  professionalRepository = new ProfessionalRepository()
) => {
  const allow = options.allow ?? ["ACTIVE"];

  return async (
    req: IAuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    const professionalId = req.auth?.professionalId;

    if (!professionalId) {
      next(AppError.unauthorized());
      return;
    }

    try {
      const professional = await professionalRepository.findById(
        professionalId
      );

      if (!professional) {
        next(AppError.unauthorized());
        return;
      }

      if (allow.includes(professional.subscriptionStatus)) {
        next();
        return;
      }

      const message =
        SUBSCRIPTION_BLOCKED_MESSAGES[professional.subscriptionStatus] ??
        "No tenés acceso a este recurso.";

      next(
        AppError.forbidden(message, {
          code: "SUBSCRIPTION_INACTIVE",
          status: professional.subscriptionStatus,
        })
      );
    } catch (error) {
      next(error);
    }
  };
};
