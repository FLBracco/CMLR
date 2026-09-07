import { describe, expect, it, vi } from "vitest";
import { AppointmentService } from "./appointment.service.js";
import type { Appointment } from "../entities/appointment.entity.js";
import type { AppointmentStatus } from "../entities/appointment-status.js";

const PROFESSIONAL_ID = "11111111-1111-4111-8111-111111111111";
const PATIENT_ID = "22222222-2222-4222-8222-222222222222";
const APPOINTMENT_ID = "33333333-3333-4333-8333-333333333333";

const buildAppointment = (overrides: Partial<Appointment> = {}): Appointment => {
  const startsAt = overrides.startsAt ?? new Date("2020-01-01T13:00:00.000Z");
  const endsAt = overrides.endsAt ?? new Date("2020-01-01T13:45:00.000Z");

  return {
    id: APPOINTMENT_ID,
    professionalId: PROFESSIONAL_ID,
    patientId: PATIENT_ID,
    startsAt,
    endsAt,
    status: "PENDING",
    reason: null,
    notes: null,
    cancellationReason: null,
    statusUpdatedAt: null,
    createdBy: PROFESSIONAL_ID,
    cancelledBy: null,
    createdAt: new Date("2020-01-01T00:00:00.000Z"),
    updatedAt: new Date("2020-01-01T00:00:00.000Z"),
    patient: { id: PATIENT_ID, firstName: "Pedro", lastName: "Garcia" },
    ...overrides,
  } as Appointment;
};

interface IFakeAppointmentRepository {
  findByIdScoped: ReturnType<typeof vi.fn>;
  findByRange: ReturnType<typeof vi.fn>;
  findByPatient: ReturnType<typeof vi.fn>;
  findOverlapping: ReturnType<typeof vi.fn>;
  countInRange: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
}

const buildFakeAppointmentRepository = (): IFakeAppointmentRepository => ({
  findByIdScoped: vi.fn(),
  findByRange: vi.fn(),
  findByPatient: vi.fn(),
  findOverlapping: vi.fn(),
  countInRange: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
});

const buildFakePatientRepository = () => ({
  findByDni: vi.fn(),
  findByIdScoped: vi.fn().mockResolvedValue({ id: PATIENT_ID, professionalId: PROFESSIONAL_ID }),
  search: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
});

const buildService = (
  appointmentRepository: IFakeAppointmentRepository,
  patientRepository = buildFakePatientRepository()
) =>
  new AppointmentService(
    appointmentRepository as never,
    patientRepository as never
  );

describe("AppointmentService.create", () => {
  it("calcula endsAt a partir de startsAt + durationMinutes", async () => {
    const appointmentRepository = buildFakeAppointmentRepository();
    appointmentRepository.findOverlapping.mockResolvedValue(null);
    appointmentRepository.create.mockResolvedValue(buildAppointment());
    appointmentRepository.findByIdScoped.mockResolvedValue(buildAppointment());

    const service = buildService(appointmentRepository);

    await service.create(PROFESSIONAL_ID, {
      patientId: PATIENT_ID,
      startsAt: "2020-01-01T13:00:00.000Z",
      durationMinutes: 45,
    });

    expect(appointmentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        startsAt: new Date("2020-01-01T13:00:00.000Z"),
        endsAt: new Date("2020-01-01T13:45:00.000Z"),
        createdBy: PROFESSIONAL_ID,
      })
    );
  });

  it("rechaza el alta si ya hay un turno solapado (PENDING/CONFIRMED)", async () => {
    const appointmentRepository = buildFakeAppointmentRepository();
    appointmentRepository.findOverlapping.mockResolvedValue(buildAppointment());

    const service = buildService(appointmentRepository);

    await expect(
      service.create(PROFESSIONAL_ID, {
        patientId: PATIENT_ID,
        startsAt: "2020-01-01T13:00:00.000Z",
        durationMinutes: 45,
      })
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(appointmentRepository.create).not.toHaveBeenCalled();
  });

  it("traduce una violación del EXCLUDE de Postgres en un 409 (carrera concurrente)", async () => {
    const appointmentRepository = buildFakeAppointmentRepository();
    appointmentRepository.findOverlapping.mockResolvedValue(null);
    appointmentRepository.create.mockRejectedValue({ code: "23P01" });

    const service = buildService(appointmentRepository);

    await expect(
      service.create(PROFESSIONAL_ID, {
        patientId: PATIENT_ID,
        startsAt: "2020-01-01T13:00:00.000Z",
        durationMinutes: 45,
      })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("rechaza el alta si el paciente no pertenece al profesional", async () => {
    const appointmentRepository = buildFakeAppointmentRepository();
    const patientRepository = buildFakePatientRepository();
    patientRepository.findByIdScoped.mockResolvedValue(null);

    const service = buildService(appointmentRepository, patientRepository);

    await expect(
      service.create(PROFESSIONAL_ID, {
        patientId: PATIENT_ID,
        startsAt: "2020-01-01T13:00:00.000Z",
        durationMinutes: 45,
      })
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("AppointmentService.update", () => {
  it("rechaza editar un turno en un estado terminal", async () => {
    const appointmentRepository = buildFakeAppointmentRepository();
    appointmentRepository.findByIdScoped.mockResolvedValue(
      buildAppointment({ status: "COMPLETED" })
    );

    const service = buildService(appointmentRepository);

    await expect(
      service.update(PROFESSIONAL_ID, APPOINTMENT_ID, { reason: "nuevo motivo" })
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(appointmentRepository.update).not.toHaveBeenCalled();
  });

  it("preserva la duración original al reprogramar solo la fecha", async () => {
    const appointmentRepository = buildFakeAppointmentRepository();
    const appointment = buildAppointment();
    appointmentRepository.findByIdScoped.mockResolvedValue(appointment);
    appointmentRepository.findOverlapping.mockResolvedValue(null);
    appointmentRepository.update.mockResolvedValue(appointment);

    const service = buildService(appointmentRepository);

    await service.update(PROFESSIONAL_ID, APPOINTMENT_ID, {
      startsAt: "2020-01-02T13:00:00.000Z",
    });

    expect(appointmentRepository.update).toHaveBeenCalledWith(
      appointment,
      expect.objectContaining({
        startsAt: new Date("2020-01-02T13:00:00.000Z"),
        endsAt: new Date("2020-01-02T13:45:00.000Z"),
      })
    );
  });
});

describe("AppointmentService.updateStatus — transiciones", () => {
  const expectTransition = async (
    from: AppointmentStatus,
    to: AppointmentStatus,
    allowed: boolean
  ) => {
    const appointmentRepository = buildFakeAppointmentRepository();
    const appointment = buildAppointment({
      status: from,
      startsAt: new Date("2020-01-01T00:00:00.000Z"),
      endsAt: new Date("2020-01-01T00:45:00.000Z"),
    });
    appointmentRepository.findByIdScoped.mockResolvedValue(appointment);
    appointmentRepository.update.mockResolvedValue(appointment);

    const service = buildService(appointmentRepository);
    const promise = service.updateStatus(PROFESSIONAL_ID, APPOINTMENT_ID, {
      status: to,
      ...(to === "CANCELLED" && { cancellationReason: "el paciente reprogramó" }),
    });

    if (allowed) {
      await expect(promise).resolves.toBeDefined();
    } else {
      await expect(promise).rejects.toMatchObject({ statusCode: 400 });
    }
  };

  it("permite PENDING -> CONFIRMED", () => expectTransition("PENDING", "CONFIRMED", true));
  it("permite PENDING -> CANCELLED", () => expectTransition("PENDING", "CANCELLED", true));
  it("permite CONFIRMED -> COMPLETED", () => expectTransition("CONFIRMED", "COMPLETED", true));
  it("rechaza COMPLETED -> PENDING (estado terminal)", () =>
    expectTransition("COMPLETED", "PENDING", false));
  it("rechaza CANCELLED -> CONFIRMED (estado terminal)", () =>
    expectTransition("CANCELLED", "CONFIRMED", false));
  it("rechaza NO_SHOW -> COMPLETED (estado terminal)", () =>
    expectTransition("NO_SHOW", "COMPLETED", false));

  it("no permite marcar COMPLETED un turno que todavía no ocurrió", async () => {
    const appointmentRepository = buildFakeAppointmentRepository();
    const future = new Date(Date.now() + 60 * 60 * 1000);
    appointmentRepository.findByIdScoped.mockResolvedValue(
      buildAppointment({ status: "PENDING", startsAt: future })
    );

    const service = buildService(appointmentRepository);

    await expect(
      service.updateStatus(PROFESSIONAL_ID, APPOINTMENT_ID, { status: "COMPLETED" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("guarda cancellationReason y cancelledBy al cancelar", async () => {
    const appointmentRepository = buildFakeAppointmentRepository();
    const appointment = buildAppointment({ status: "PENDING" });
    appointmentRepository.findByIdScoped.mockResolvedValue(appointment);
    appointmentRepository.update.mockResolvedValue(appointment);

    const service = buildService(appointmentRepository);

    await service.updateStatus(PROFESSIONAL_ID, APPOINTMENT_ID, {
      status: "CANCELLED",
      cancellationReason: "el paciente reprogramó",
    });

    expect(appointmentRepository.update).toHaveBeenCalledWith(
      appointment,
      expect.objectContaining({
        status: "CANCELLED",
        cancellationReason: "el paciente reprogramó",
        cancelledBy: PROFESSIONAL_ID,
      })
    );
  });
});

describe("AppointmentService.listByRange", () => {
  it("rechaza un rango mayor a 62 días", async () => {
    const appointmentRepository = buildFakeAppointmentRepository();
    const service = buildService(appointmentRepository);

    await expect(
      service.listByRange(
        PROFESSIONAL_ID,
        new Date("2020-01-01T00:00:00.000Z"),
        new Date("2020-04-01T00:00:00.000Z")
      )
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(appointmentRepository.findByRange).not.toHaveBeenCalled();
  });

  it("rechaza un rango invertido (to <= from)", async () => {
    const appointmentRepository = buildFakeAppointmentRepository();
    const service = buildService(appointmentRepository);

    await expect(
      service.listByRange(
        PROFESSIONAL_ID,
        new Date("2020-01-10T00:00:00.000Z"),
        new Date("2020-01-01T00:00:00.000Z")
      )
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("acepta un rango dentro del límite y delega en el repository", async () => {
    const appointmentRepository = buildFakeAppointmentRepository();
    appointmentRepository.findByRange.mockResolvedValue([buildAppointment()]);
    const service = buildService(appointmentRepository);

    const result = await service.listByRange(
      PROFESSIONAL_ID,
      new Date("2020-01-01T00:00:00.000Z"),
      new Date("2020-01-08T00:00:00.000Z")
    );

    expect(result.appointments).toHaveLength(1);
  });
});
