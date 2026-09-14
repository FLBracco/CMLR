import { describe, expect, it, vi } from "vitest";
import { ConsultationService } from "./consultation.service.js";
import { parseDateOnlyParam } from "../controllers/consultation.controller.js";
import type { Consultation } from "../entities/consultation.entity.js";

const PROFESSIONAL_ID = "11111111-1111-4111-8111-111111111111";
const PATIENT_ID = "22222222-2222-4222-8222-222222222222";
const CONSULTATION_ID = "33333333-3333-4333-8333-333333333333";

const buildConsultation = (
  overrides: Partial<Consultation> = {}
): Consultation =>
  ({
    id: CONSULTATION_ID,
    patientId: PATIENT_ID,
    consultationDate: "2026-09-14",
    observations: "Observaciones",
    diagnosis: null,
    followUpPlan: "Seguimiento",
    createdAt: new Date("2026-09-14T12:00:00.000Z"),
    updatedAt: new Date("2026-09-14T12:00:00.000Z"),
    patient: {
      id: PATIENT_ID,
      firstName: "Ana",
      lastName: "Pérez",
      dni: "30111222",
    },
    ...overrides,
  }) as Consultation;

interface IFakeConsultationRepository {
  findByPatient: ReturnType<typeof vi.fn>;
  findByIdWithPatient: ReturnType<typeof vi.fn>;
  countByProfessionalSince: ReturnType<typeof vi.fn>;
  findByProfessionalAndDateRange: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
}

const buildFakeConsultationRepository = (): IFakeConsultationRepository => ({
  findByPatient: vi.fn(),
  findByIdWithPatient: vi.fn(),
  countByProfessionalSince: vi.fn(),
  findByProfessionalAndDateRange: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
});

const buildFakePatientRepository = () => ({
  findByDni: vi.fn(),
  findByIdScoped: vi
    .fn()
    .mockResolvedValue({ id: PATIENT_ID, professionalId: PROFESSIONAL_ID }),
  search: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
});

const buildService = (
  consultationRepository: IFakeConsultationRepository,
  patientRepository = buildFakePatientRepository()
) =>
  new ConsultationService(
    consultationRepository as never,
    patientRepository as never
  );

describe("ConsultationService.listByDateRange", () => {
  it("consulta el repositorio con el professionalId y el rango recibidos", async () => {
    const consultationRepository = buildFakeConsultationRepository();
    consultationRepository.findByProfessionalAndDateRange.mockResolvedValue([
      buildConsultation(),
    ]);

    const service = buildService(consultationRepository);

    await service.listByDateRange(PROFESSIONAL_ID, "2026-09-01", "2026-09-14");

    expect(
      consultationRepository.findByProfessionalAndDateRange
    ).toHaveBeenCalledWith(PROFESSIONAL_ID, "2026-09-01", "2026-09-14");
  });

  it("mapea el paciente solo a id/firstName/lastName, sin campos sensibles", async () => {
    const consultationRepository = buildFakeConsultationRepository();
    consultationRepository.findByProfessionalAndDateRange.mockResolvedValue([
      buildConsultation(),
    ]);

    const service = buildService(consultationRepository);

    const result = await service.listByDateRange(
      PROFESSIONAL_ID,
      "2026-09-01",
      "2026-09-14"
    );

    expect(result.consultations[0]?.patient).toEqual({
      id: PATIENT_ID,
      firstName: "Ana",
      lastName: "Pérez",
    });
    expect(result.consultations[0]?.patient).not.toHaveProperty("dni");
  });

  it("formatea consultationDate como YYYY-MM-DD tanto si el repo devuelve Date como string", async () => {
    const consultationRepository = buildFakeConsultationRepository();
    consultationRepository.findByProfessionalAndDateRange.mockResolvedValue([
      buildConsultation({ consultationDate: "2026-09-14" as never }),
      buildConsultation({
        id: "44444444-4444-4444-8444-444444444444",
        consultationDate: new Date("2026-09-15T00:00:00.000Z"),
      }),
    ]);

    const service = buildService(consultationRepository);

    const result = await service.listByDateRange(
      PROFESSIONAL_ID,
      "2026-09-01",
      "2026-09-30"
    );

    expect(result.consultations.map((c) => c.consultationDate)).toEqual([
      "2026-09-14",
      "2026-09-15",
    ]);
  });

  it("rechaza si 'to' es anterior a 'from'", async () => {
    const consultationRepository = buildFakeConsultationRepository();
    const service = buildService(consultationRepository);

    await expect(
      service.listByDateRange(PROFESSIONAL_ID, "2026-09-14", "2026-09-01")
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(
      consultationRepository.findByProfessionalAndDateRange
    ).not.toHaveBeenCalled();
  });

  it("rechaza un rango de más de 62 días", async () => {
    const consultationRepository = buildFakeConsultationRepository();
    const service = buildService(consultationRepository);

    await expect(
      service.listByDateRange(PROFESSIONAL_ID, "2026-01-01", "2026-03-05")
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("acepta un rango de exactamente 62 días", async () => {
    const consultationRepository = buildFakeConsultationRepository();
    consultationRepository.findByProfessionalAndDateRange.mockResolvedValue(
      []
    );
    const service = buildService(consultationRepository);

    await expect(
      service.listByDateRange(PROFESSIONAL_ID, "2026-01-01", "2026-03-04")
    ).resolves.toEqual({ consultations: [] });
  });

  it("devuelve una lista vacía sin error cuando no hay consultas", async () => {
    const consultationRepository = buildFakeConsultationRepository();
    consultationRepository.findByProfessionalAndDateRange.mockResolvedValue(
      []
    );
    const service = buildService(consultationRepository);

    const result = await service.listByDateRange(
      PROFESSIONAL_ID,
      "2026-09-01",
      "2026-09-14"
    );

    expect(result).toEqual({ consultations: [] });
  });
});

describe("parseDateOnlyParam", () => {
  it("acepta 'YYYY-MM-DD' y lo devuelve tal cual", () => {
    expect(parseDateOnlyParam("2026-09-14", "from")).toBe("2026-09-14");
  });

  it("rechaza un timestamp ISO completo", () => {
    expect(() =>
      parseDateOnlyParam("2026-09-14T00:00:00.000Z", "from")
    ).toThrowError(expect.objectContaining({ statusCode: 400 }));
  });

  it("rechaza un formato de fecha no ISO", () => {
    expect(() => parseDateOnlyParam("14/09/2026", "from")).toThrowError(
      expect.objectContaining({ statusCode: 400 })
    );
  });

  it("rechaza una fecha con formato correcto pero calendario inválido (mes/día fuera de rango)", () => {
    expect(() => parseDateOnlyParam("2026-13-45", "from")).toThrowError(
      expect.objectContaining({ statusCode: 400 })
    );
    expect(() => parseDateOnlyParam("2026-02-30", "from")).toThrowError(
      expect.objectContaining({ statusCode: 400 })
    );
  });

  it("rechaza un valor vacío o ausente", () => {
    expect(() => parseDateOnlyParam("", "from")).toThrowError(
      expect.objectContaining({ statusCode: 400 })
    );
    expect(() => parseDateOnlyParam(undefined, "from")).toThrowError(
      expect.objectContaining({ statusCode: 400 })
    );
  });
});
