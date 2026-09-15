import { describe, expect, it, vi } from "vitest";
import { AdminProfessionalService } from "./admin-professional.service.js";
import type { Professional } from "../../professionals/entities/professional.entity.js";
import type { SubscriptionStatus } from "../../professionals/entities/subscription-status.js";

const PROFESSIONAL_ID = "11111111-1111-4111-8111-111111111111";

const buildProfessional = (
  overrides: Partial<Professional> = {}
): Professional =>
  ({
    id: PROFESSIONAL_ID,
    firstName: "Ana",
    lastName: "Pérez",
    email: "ana@example.com",
    licenseNumber: "MP-1234",
    speciality: { code: "psychologist" },
    subscriptionStatus: "PENDING",
    subscriptionUpdatedAt: null,
    createdAt: new Date("2020-01-01T00:00:00.000Z"),
    ...overrides,
  } as Professional);

const buildFakeProfessionalRepository = () => ({
  findById: vi.fn(),
  findAll: vi.fn(),
  updateSubscriptionStatus: vi.fn(),
});

const buildService = (
  professionalRepository = buildFakeProfessionalRepository()
) => new AdminProfessionalService(professionalRepository as never);

describe("AdminProfessionalService.updateSubscriptionStatus — transiciones", () => {
  const expectTransition = async (
    from: SubscriptionStatus,
    to: SubscriptionStatus,
    allowed: boolean
  ) => {
    const professionalRepository = buildFakeProfessionalRepository();
    const professional = buildProfessional({ subscriptionStatus: from });
    professionalRepository.findById.mockResolvedValue(professional);
    professionalRepository.updateSubscriptionStatus.mockResolvedValue(
      buildProfessional({ subscriptionStatus: to })
    );

    const service = buildService(professionalRepository);
    const promise = service.updateSubscriptionStatus(PROFESSIONAL_ID, to);

    if (allowed) {
      await expect(promise).resolves.toBeDefined();
    } else {
      await expect(promise).rejects.toMatchObject({ statusCode: 400 });
    }
  };

  it("permite PENDING -> PAYMENT_REPORTED", () =>
    expectTransition("PENDING", "PAYMENT_REPORTED", true));
  it("permite PENDING -> ACTIVE (comprobante llegó directo por WhatsApp)", () =>
    expectTransition("PENDING", "ACTIVE", true));
  it("permite PAYMENT_REPORTED -> ACTIVE", () =>
    expectTransition("PAYMENT_REPORTED", "ACTIVE", true));
  it("permite PAYMENT_REPORTED -> PENDING (rechazo del comprobante)", () =>
    expectTransition("PAYMENT_REPORTED", "PENDING", true));
  it("permite ACTIVE -> DISABLED", () =>
    expectTransition("ACTIVE", "DISABLED", true));
  it("permite DISABLED -> ACTIVE", () =>
    expectTransition("DISABLED", "ACTIVE", true));

  it("rechaza PAYMENT_REPORTED -> DISABLED (nunca tuvo acceso)", () =>
    expectTransition("PAYMENT_REPORTED", "DISABLED", false));
  it("rechaza ACTIVE -> PENDING", () =>
    expectTransition("ACTIVE", "PENDING", false));
  it("rechaza ACTIVE -> PAYMENT_REPORTED", () =>
    expectTransition("ACTIVE", "PAYMENT_REPORTED", false));
  it("rechaza DISABLED -> PAYMENT_REPORTED", () =>
    expectTransition("DISABLED", "PAYMENT_REPORTED", false));
  it("rechaza DISABLED -> PENDING", () =>
    expectTransition("DISABLED", "PENDING", false));

  it("es no-op cuando el estado destino es igual al actual", async () => {
    const professionalRepository = buildFakeProfessionalRepository();
    const professional = buildProfessional({ subscriptionStatus: "PAYMENT_REPORTED" });
    professionalRepository.findById.mockResolvedValue(professional);
    professionalRepository.updateSubscriptionStatus.mockResolvedValue(professional);

    const service = buildService(professionalRepository);

    await expect(
      service.updateSubscriptionStatus(PROFESSIONAL_ID, "PAYMENT_REPORTED")
    ).resolves.toBeDefined();
  });

  it("lanza 404 si el profesional no existe", async () => {
    const professionalRepository = buildFakeProfessionalRepository();
    professionalRepository.findById.mockResolvedValue(null);

    const service = buildService(professionalRepository);

    await expect(
      service.updateSubscriptionStatus(PROFESSIONAL_ID, "ACTIVE")
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
