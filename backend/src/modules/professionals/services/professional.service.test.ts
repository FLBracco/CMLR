import { describe, expect, it, vi } from "vitest";
import { ProfessionalService } from "./professional.service.js";
import type { Professional } from "../entities/professional.entity.js";
import type { SubscriptionStatus } from "../entities/subscription-status.js";

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
  findByLicenseNumber: vi.fn(),
  findAll: vi.fn(),
  updateSubscriptionStatus: vi.fn(),
  update: vi.fn(),
});

const buildService = (
  professionalRepository = buildFakeProfessionalRepository()
) => new ProfessionalService(professionalRepository as never, {} as never);

describe("ProfessionalService.reportSubscriptionPayment", () => {
  const setup = (status: SubscriptionStatus) => {
    const professionalRepository = buildFakeProfessionalRepository();
    const professional = buildProfessional({ subscriptionStatus: status });
    professionalRepository.findById.mockResolvedValue(professional);
    professionalRepository.updateSubscriptionStatus.mockResolvedValue(
      buildProfessional({ subscriptionStatus: "PAYMENT_REPORTED" })
    );
    return { professionalRepository, service: buildService(professionalRepository) };
  };

  it("PENDING -> pasa a PAYMENT_REPORTED", async () => {
    const { professionalRepository, service } = setup("PENDING");

    const result = await service.reportSubscriptionPayment(PROFESSIONAL_ID);

    expect(professionalRepository.updateSubscriptionStatus).toHaveBeenCalledWith(
      expect.objectContaining({ id: PROFESSIONAL_ID }),
      "PAYMENT_REPORTED"
    );
    expect(result.subscriptionStatus).toBe("PAYMENT_REPORTED");
  });

  it("PAYMENT_REPORTED -> no-op, no vuelve a llamar al repositorio", async () => {
    const { professionalRepository, service } = setup("PAYMENT_REPORTED");

    const result = await service.reportSubscriptionPayment(PROFESSIONAL_ID);

    expect(professionalRepository.updateSubscriptionStatus).not.toHaveBeenCalled();
    expect(result.subscriptionStatus).toBe("PAYMENT_REPORTED");
  });

  it("ACTIVE -> rechaza con 400", async () => {
    const { professionalRepository, service } = setup("ACTIVE");

    await expect(
      service.reportSubscriptionPayment(PROFESSIONAL_ID)
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(professionalRepository.updateSubscriptionStatus).not.toHaveBeenCalled();
  });

  it("DISABLED -> rechaza con 403", async () => {
    const { professionalRepository, service } = setup("DISABLED");

    await expect(
      service.reportSubscriptionPayment(PROFESSIONAL_ID)
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(professionalRepository.updateSubscriptionStatus).not.toHaveBeenCalled();
  });

  it("lanza 404 si el profesional no existe", async () => {
    const professionalRepository = buildFakeProfessionalRepository();
    professionalRepository.findById.mockResolvedValue(null);
    const service = buildService(professionalRepository);

    await expect(
      service.reportSubscriptionPayment(PROFESSIONAL_ID)
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
