import { describe, expect, it, vi } from "vitest";
import { requireActiveSubscription } from "./require-active-subscription.js";
import type { IAuthenticatedRequest } from "./authenticate.js";
import type { Professional } from "../../modules/professionals/entities/professional.entity.js";

const PROFESSIONAL_ID = "11111111-1111-4111-8111-111111111111";

const buildProfessional = (
  overrides: Partial<Professional> = {}
): Professional =>
  ({
    id: PROFESSIONAL_ID,
    subscriptionStatus: "ACTIVE",
    subscriptionUpdatedAt: new Date(),
    ...overrides,
  } as Professional);

const buildFakeProfessionalRepository = () => ({
  findById: vi.fn(),
  updateSubscriptionStatus: vi.fn(),
});

const buildReq = (professionalId?: string): IAuthenticatedRequest =>
  ({ auth: professionalId ? { professionalId } : undefined } as IAuthenticatedRequest);

describe("requireActiveSubscription", () => {
  it("ACTIVE no vencido -> next() sin argumentos, sin escrituras", async () => {
    const repo = buildFakeProfessionalRepository();
    repo.findById.mockResolvedValue(buildProfessional());

    const middleware = requireActiveSubscription({}, repo as never);
    const next = vi.fn();

    await middleware(buildReq(PROFESSIONAL_ID), {} as never, next);

    expect(next).toHaveBeenCalledWith();
    expect(repo.updateSubscriptionStatus).not.toHaveBeenCalled();
  });

  it("ACTIVE vencido -> persiste DISABLED y rechaza con el mensaje de DISABLED", async () => {
    const repo = buildFakeProfessionalRepository();
    const expired = buildProfessional({
      subscriptionUpdatedAt: new Date(2020, 0, 1),
    });
    repo.findById.mockResolvedValue(expired);
    repo.updateSubscriptionStatus.mockResolvedValue(
      buildProfessional({ subscriptionStatus: "DISABLED" })
    );

    const middleware = requireActiveSubscription({}, repo as never);
    const next = vi.fn();

    await middleware(buildReq(PROFESSIONAL_ID), {} as never, next);

    expect(repo.updateSubscriptionStatus).toHaveBeenCalledWith(
      expired,
      "DISABLED"
    );
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: "Tu suscripción está desactivada. Contactá al administrador.",
        details: expect.objectContaining({
          code: "SUBSCRIPTION_INACTIVE",
          status: "DISABLED",
        }),
      })
    );
  });

  it("PENDING -> 403 con el mensaje de PENDING", async () => {
    const repo = buildFakeProfessionalRepository();
    repo.findById.mockResolvedValue(
      buildProfessional({ subscriptionStatus: "PENDING", subscriptionUpdatedAt: null })
    );

    const middleware = requireActiveSubscription({}, repo as never);
    const next = vi.fn();

    await middleware(buildReq(PROFESSIONAL_ID), {} as never, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: "Tu cuenta está pendiente de activación.",
      })
    );
  });

  it("sin professionalId en el auth -> 401 sin consultar la DB", async () => {
    const repo = buildFakeProfessionalRepository();
    const middleware = requireActiveSubscription({}, repo as never);
    const next = vi.fn();

    await middleware(buildReq(undefined), {} as never, next);

    expect(repo.findById).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 })
    );
  });

  it("profesional inexistente -> 401", async () => {
    const repo = buildFakeProfessionalRepository();
    repo.findById.mockResolvedValue(null);

    const middleware = requireActiveSubscription({}, repo as never);
    const next = vi.fn();

    await middleware(buildReq(PROFESSIONAL_ID), {} as never, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 })
    );
  });

  it("respeta options.allow", async () => {
    const repo = buildFakeProfessionalRepository();
    repo.findById.mockResolvedValue(
      buildProfessional({ subscriptionStatus: "PENDING", subscriptionUpdatedAt: null })
    );

    const middleware = requireActiveSubscription(
      { allow: ["PENDING", "ACTIVE"] },
      repo as never
    );
    const next = vi.fn();

    await middleware(buildReq(PROFESSIONAL_ID), {} as never, next);

    expect(next).toHaveBeenCalledWith();
  });
});
