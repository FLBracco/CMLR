import { ProfessionalRepository } from "../repositories/professional.repository.js";
import type { Professional } from "../entities/professional.entity.js";
import {
  getExpirationScanCutoff,
  isSubscriptionExpired,
} from "../entities/subscription-expiration.js";

// Único lugar que persiste la transición ACTIVE -> DISABLED por vencimiento
// (self-healing en los puntos de lectura + barrido periódico comparten esto,
// así que la escritura nunca queda duplicada en dos lugares).
export class SubscriptionExpirationService {
  constructor(
    private readonly professionalRepository = new ProfessionalRepository()
  ) {}

  async enforce(professional: Professional): Promise<Professional> {
    if (!isSubscriptionExpired(professional)) {
      return professional;
    }

    return this.professionalRepository.updateSubscriptionStatus(
      professional,
      "DISABLED"
    );
  }

  async enforceMany(professionals: Professional[]): Promise<Professional[]> {
    const result: Professional[] = [];

    for (const professional of professionals) {
      result.push(await this.enforce(professional));
    }

    return result;
  }

  // Barrido: candidatos traídos con un pre-filtro conservador en SQL,
  // desactivados solo los que isSubscriptionExpired confirma vencidos.
  // Devuelve cuántos se desactivaron, para loguear una sola línea si hubo algo.
  async sweep(now: Date = new Date()): Promise<number> {
    const cutoff = getExpirationScanCutoff(now);
    const candidates = await this.professionalRepository.findActiveUpdatedBefore(
      cutoff
    );

    let disabledCount = 0;

    for (const candidate of candidates) {
      if (!isSubscriptionExpired(candidate, now)) continue;

      await this.professionalRepository.updateSubscriptionStatus(
        candidate,
        "DISABLED"
      );
      disabledCount += 1;
    }

    return disabledCount;
  }
}
