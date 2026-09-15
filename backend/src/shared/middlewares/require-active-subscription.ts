import type { NextFunction, Response } from "express";
import { AppError } from "../errors/AppError.js";
import type { IAuthenticatedRequest } from "./authenticate.js";
import { ProfessionalRepository } from "../../modules/professionals/repositories/professional.repository.js";
import { SubscriptionExpirationService } from "../../modules/professionals/services/subscription-expiration.service.js";
import type { SubscriptionStatus } from "../../modules/professionals/entities/subscription-status.js";

const SUBSCRIPTION_BLOCKED_MESSAGES: Partial<Record<SubscriptionStatus, string>> = {
  PENDING: "Tu cuenta está pendiente de activación.",
  PAYMENT_REPORTED:
    "Recibimos tu aviso de pago. Estamos verificando el comprobante para activar tu cuenta.",
  DISABLED: "Tu suscripción está desactivada. Contactá al administrador.",
};

export interface IRequireActiveSubscriptionOptions {
  allow?: SubscriptionStatus[];
}

export const requireActiveSubscription = (
  options: IRequireActiveSubscriptionOptions = {},
  professionalRepository = new ProfessionalRepository(),
  subscriptionExpiration = new SubscriptionExpirationService(
    professionalRepository
  )
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
      let professional = await professionalRepository.findById(
        professionalId
      );

      if (!professional) {
        next(AppError.unauthorized());
        return;
      }

      // Self-healing: si ya venció el mes de suscripción, se persiste la baja
      // acá mismo (no solo se bloquea la request) para que el estado real
      // quede corregido de una y el mensaje sea el de DISABLED, no uno genérico.
      professional = await subscriptionExpiration.enforce(professional);

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
