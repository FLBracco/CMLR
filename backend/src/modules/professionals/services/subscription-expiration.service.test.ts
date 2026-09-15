import { describe, expect, it, vi } from "vitest";
import { SubscriptionExpirationService } from "./subscription-expiration.service.js";
import type { Professional } from "../entities/professional.entity.js";

const PROFESSIONAL_ID = "11111111-1111-4111-8111-111111111111";

const buildProfessional = (
  overrides: Partial<Professional> = {}
): Professional =>
  ({
    id: PROFESSIONAL_ID,
    firstName: "Ana",
    lastName: "Pérez",
    subscriptionStatus: "ACTIVE",
    subscriptionUpdatedAt: null,
    ...overrides,
  } as Professional);

const buildFakeProfessionalRepository = () => ({
  findActiveUpdatedBefore: vi.fn(),
  updateSubscriptionStatus: vi.fn(),
});

const buildService = (
  professionalRepository = buildFakeProfessionalRepository()
) => new SubscriptionExpirationService(professionalRepository as never);

describe("SubscriptionExpirationService.enforce", () => {
  it("vencido -> desactiva y devuelve la entidad actualizada", async () => {
    const repo = buildFakeProfessionalRepository();
    const professional = buildProfessional({
      subscriptionUpdatedAt: new Date(2020, 0, 1),
    });
    const updated = buildProfessional({ subscriptionStatus: "DISABLED" });
    repo.updateSubscriptionStatus.mockResolvedValue(updated);

    const service = buildService(repo);
    const result = await service.enforce(professional);

    expect(repo.updateSubscriptionStatus).toHaveBeenCalledTimes(1);
    expect(repo.updateSubscriptionStatus).toHaveBeenCalledWith(
      professional,
      "DISABLED"
    );
    expect(result).toBe(updated);
  });

  it("no vencido -> no escribe, devuelve el mismo objeto", async () => {
    const repo = buildFakeProfessionalRepository();
    const professional = buildProfessional({
      subscriptionUpdatedAt: new Date(),
    });

    const service = buildService(repo);
    const result = await service.enforce(professional);

    expect(repo.updateSubscriptionStatus).not.toHaveBeenCalled();
    expect(result).toBe(professional);
  });

  it("subscriptionUpdatedAt null -> no escribe", async () => {
    const repo = buildFakeProfessionalRepository();
    const professional = buildProfessional({ subscriptionUpdatedAt: null });

    const service = buildService(repo);
    await service.enforce(professional);

    expect(repo.updateSubscriptionStatus).not.toHaveBeenCalled();
  });

  it("estado distinto de ACTIVE -> no escribe", async () => {
    const repo = buildFakeProfessionalRepository();
    const professional = buildProfessional({
      subscriptionStatus: "DISABLED",
      subscriptionUpdatedAt: new Date(2020, 0, 1),
    });

    const service = buildService(repo);
    await service.enforce(professional);

    expect(repo.updateSubscriptionStatus).not.toHaveBeenCalled();
  });
});

describe("SubscriptionExpirationService.sweep", () => {
  it("consulta con un cutoff de al menos 27 días atrás", async () => {
    const repo = buildFakeProfessionalRepository();
    repo.findActiveUpdatedBefore.mockResolvedValue([]);
    const now = new Date(2026, 5, 15);

    const service = buildService(repo);
    await service.sweep(now);

    const cutoffArg = repo.findActiveUpdatedBefore.mock.calls[0][0] as Date;
    const diffDays =
      (now.getTime() - cutoffArg.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThanOrEqual(27);
  });

  it("descarta candidatos que el SQL trajo pero todavía no vencieron", async () => {
    const repo = buildFakeProfessionalRepository();
    const now = new Date(2026, 1, 15);
    const notExpiredYet = buildProfessional({
      id: "not-expired",
      subscriptionUpdatedAt: new Date(2026, 0, 20),
    });
    repo.findActiveUpdatedBefore.mockResolvedValue([notExpiredYet]);

    const service = buildService(repo);
    const count = await service.sweep(now);

    expect(repo.updateSubscriptionStatus).not.toHaveBeenCalled();
    expect(count).toBe(0);
  });

  it("desactiva solo los candidatos realmente vencidos y cuenta cuántos", async () => {
    const repo = buildFakeProfessionalRepository();
    const now = new Date(2026, 2, 1);
    const expired = buildProfessional({
      id: "expired",
      subscriptionUpdatedAt: new Date(2026, 0, 15),
    });
    const notExpiredYet = buildProfessional({
      id: "not-expired",
      subscriptionUpdatedAt: new Date(2026, 1, 20),
    });
    repo.findActiveUpdatedBefore.mockResolvedValue([expired, notExpiredYet]);
    repo.updateSubscriptionStatus.mockResolvedValue(
      buildProfessional({ subscriptionStatus: "DISABLED" })
    );

    const service = buildService(repo);
    const count = await service.sweep(now);

    expect(repo.updateSubscriptionStatus).toHaveBeenCalledTimes(1);
    expect(repo.updateSubscriptionStatus).toHaveBeenCalledWith(
      expired,
      "DISABLED"
    );
    expect(count).toBe(1);
  });

  it("sin candidatos -> cero escrituras", async () => {
    const repo = buildFakeProfessionalRepository();
    repo.findActiveUpdatedBefore.mockResolvedValue([]);

    const service = buildService(repo);
    const count = await service.sweep(new Date());

    expect(repo.updateSubscriptionStatus).not.toHaveBeenCalled();
    expect(count).toBe(0);
  });
});
