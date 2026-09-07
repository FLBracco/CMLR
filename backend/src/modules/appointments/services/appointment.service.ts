import { AppError } from "../../../shared/errors/AppError.js";
import type { Appointment } from "../entities/appointment.entity.js";
import { AppointmentRepository } from "../repositories/appointment.repository.js";
import { PatientRepository } from "../../patients/repositories/patient.repository.js";
import type { CreateAppointmentDto } from "../dto/create-appointment.dto.js";
import type { UpdateAppointmentDto } from "../dto/update-appointment.dto.js";
import type { UpdateAppointmentStatusDto } from "../dto/update-appointment-status.dto.js";
import type {
  IAppointmentDto,
  IAppointmentListDto,
  IAppointmentStatsDto,
} from "../dto/appointment-response.dto.js";
import type { AppointmentStatus } from "../entities/appointment-status.js";

const MAX_RANGE_DAYS = 62;
const EXCLUSION_VIOLATION_CODE = "23P01";

// Transiciones con sentido de negocio: desde un turno activo (pendiente o
// confirmado) se puede pasar a cualquier estado terminal, o de pendiente a
// confirmado. Los tres estados terminales no admiten ninguna transición: un
// turno completado, cancelado o ausente no vuelve a estar activo.
const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"],
  CONFIRMED: ["COMPLETED", "CANCELLED", "NO_SHOW"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

const TERMINAL_STATUSES: AppointmentStatus[] = [
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

export class AppointmentService {
  constructor(
    private readonly appointmentRepository = new AppointmentRepository(),
    private readonly patientRepository = new PatientRepository()
  ) {}

  async create(
    professionalId: string,
    dto: CreateAppointmentDto
  ): Promise<IAppointmentDto> {
    await this.assertPatientOwnership(professionalId, dto.patientId);

    const startsAt = new Date(dto.startsAt);
    const endsAt = this.addMinutes(startsAt, dto.durationMinutes);

    await this.assertNoOverlap(professionalId, startsAt, endsAt);

    const created = await this.saveGuardingOverlap(() =>
      this.appointmentRepository.create({
        professionalId,
        patientId: dto.patientId,
        startsAt,
        endsAt,
        reason: dto.reason ?? null,
        notes: dto.notes ?? null,
        createdBy: professionalId,
      })
    );

    return this.toDto(
      await this.getScopedAppointment(professionalId, created.id)
    );
  }

  async update(
    professionalId: string,
    id: string,
    dto: UpdateAppointmentDto
  ): Promise<IAppointmentDto> {
    const appointment = await this.getScopedAppointment(professionalId, id);

    if (TERMINAL_STATUSES.includes(appointment.status)) {
      throw AppError.badRequest(
        "No se puede editar un turno completado, cancelado o ausente."
      );
    }

    const timeChanged =
      dto.startsAt !== undefined || dto.durationMinutes !== undefined;

    const startsAt = dto.startsAt ? new Date(dto.startsAt) : appointment.startsAt;
    const currentDurationMinutes = Math.round(
      (appointment.endsAt.getTime() - appointment.startsAt.getTime()) / 60000
    );
    const durationMinutes = dto.durationMinutes ?? currentDurationMinutes;
    const endsAt = this.addMinutes(startsAt, durationMinutes);

    if (timeChanged) {
      await this.assertNoOverlap(professionalId, startsAt, endsAt, id);
    }

    const updated = await this.saveGuardingOverlap(() =>
      this.appointmentRepository.update(appointment, {
        ...(timeChanged && { startsAt, endsAt }),
        ...(dto.reason !== undefined && { reason: dto.reason }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      })
    );

    return this.toDto(updated);
  }

  async updateStatus(
    professionalId: string,
    id: string,
    dto: UpdateAppointmentStatusDto
  ): Promise<IAppointmentDto> {
    const appointment = await this.getScopedAppointment(professionalId, id);
    const current = appointment.status;

    if (dto.status !== current && !ALLOWED_TRANSITIONS[current].includes(dto.status)) {
      throw AppError.badRequest(`No se puede pasar de ${current} a ${dto.status}.`);
    }

    if (
      (dto.status === "COMPLETED" || dto.status === "NO_SHOW") &&
      appointment.startsAt.getTime() > Date.now()
    ) {
      throw AppError.badRequest(
        "No se puede marcar como completado o ausente un turno que todavía no ocurrió."
      );
    }

    const updated = await this.appointmentRepository.update(appointment, {
      status: dto.status,
      statusUpdatedAt: new Date(),
      ...(dto.status === "CANCELLED" && {
        cancellationReason: dto.cancellationReason ?? null,
        cancelledBy: professionalId,
      }),
    });

    return this.toDto(updated);
  }

  async listByRange(
    professionalId: string,
    from: Date,
    to: Date,
    status?: AppointmentStatus
  ): Promise<IAppointmentListDto> {
    this.assertValidRange(from, to);

    const appointments = await this.appointmentRepository.findByRange(
      professionalId,
      from,
      to,
      status
    );

    return {
      appointments: appointments.map((appointment) => this.toDto(appointment)),
    };
  }

  async getById(professionalId: string, id: string): Promise<IAppointmentDto> {
    return this.toDto(await this.getScopedAppointment(professionalId, id));
  }

  async listByPatient(
    professionalId: string,
    patientId: string,
    upcomingOnly = false
  ): Promise<IAppointmentListDto> {
    await this.assertPatientOwnership(professionalId, patientId);

    const appointments = await this.appointmentRepository.findByPatient(
      patientId,
      professionalId,
      { upcomingOnly }
    );

    return {
      appointments: appointments.map((appointment) => this.toDto(appointment)),
    };
  }

  // referenceDate es inyectable (en vez de usar `new Date()` adentro) para
  // que sea testeable con una fecha fija y para dejar la puerta abierta a que
  // el cliente mande su propio "hoy" si el desfasaje de TZ con el server
  // llega a importar (ver riesgo de aritmética de fechas de la Fase 2).
  async getStats(
    professionalId: string,
    referenceDate: Date = new Date()
  ): Promise<IAppointmentStatsDto> {
    const startOfDay = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate()
    );
    const endOfDay = this.addMinutes(startOfDay, 24 * 60);
    const startOfWeek = this.getStartOfWeek(referenceDate);
    const endOfWeek = this.addMinutes(startOfWeek, 7 * 24 * 60);

    const [appointmentsToday, appointmentsThisWeek, pendingConfirmation] =
      await Promise.all([
        this.appointmentRepository.countInRange(professionalId, startOfDay, endOfDay),
        this.appointmentRepository.countInRange(professionalId, startOfWeek, endOfWeek),
        this.appointmentRepository.countByStatus(professionalId, "PENDING"),
      ]);

    return { appointmentsToday, appointmentsThisWeek, pendingConfirmation };
  }

  private getStartOfWeek(date: Date): Date {
    const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = result.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    result.setDate(result.getDate() + diffToMonday);
    return result;
  }

  private assertValidRange(from: Date, to: Date): void {
    if (to <= from) {
      throw AppError.badRequest("El rango de fechas no es válido.");
    }

    const spanDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);

    if (spanDays > MAX_RANGE_DAYS) {
      throw AppError.badRequest(
        `El rango de fechas no puede superar los ${MAX_RANGE_DAYS} días.`
      );
    }
  }

  private addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
  }

  private async assertNoOverlap(
    professionalId: string,
    startsAt: Date,
    endsAt: Date,
    excludeId?: string
  ): Promise<void> {
    const overlapping = await this.appointmentRepository.findOverlapping(
      professionalId,
      startsAt,
      endsAt,
      excludeId
    );

    if (overlapping) {
      throw AppError.conflict("Ya existe un turno en ese horario.");
    }
  }

  // La validación previa (assertNoOverlap) es "leer y después escribir" y no
  // es atómica: dos altas simultáneas pueden pasarla ambas. El EXCLUDE de
  // Postgres es la garantía real; acá sólo traducimos su error a AppError.
  private async saveGuardingOverlap(
    operation: () => Promise<Appointment>
  ): Promise<Appointment> {
    try {
      return await operation();
    } catch (error) {
      if (this.isExclusionViolation(error)) {
        throw AppError.conflict("Ya existe un turno en ese horario.");
      }
      throw error;
    }
  }

  private isExclusionViolation(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === EXCLUSION_VIOLATION_CODE
    );
  }

  private async assertPatientOwnership(
    professionalId: string,
    patientId: string
  ): Promise<void> {
    const patient = await this.patientRepository.findByIdScoped(
      patientId,
      professionalId
    );

    if (!patient) {
      throw AppError.notFound("Paciente no encontrado.");
    }
  }

  private async getScopedAppointment(
    professionalId: string,
    id: string
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findByIdScoped(
      id,
      professionalId
    );

    if (!appointment) {
      throw AppError.notFound("Turno no encontrado.");
    }

    return appointment;
  }

  private toDto(appointment: Appointment): IAppointmentDto {
    return {
      id: appointment.id,
      professionalId: appointment.professionalId,
      patientId: appointment.patientId,
      patient: {
        id: appointment.patient.id,
        firstName: appointment.patient.firstName,
        lastName: appointment.patient.lastName,
      },
      startsAt: appointment.startsAt.toISOString(),
      endsAt: appointment.endsAt.toISOString(),
      status: appointment.status,
      reason: appointment.reason,
      notes: appointment.notes,
      cancellationReason: appointment.cancellationReason,
      statusUpdatedAt: appointment.statusUpdatedAt
        ? appointment.statusUpdatedAt.toISOString()
        : null,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    };
  }
}
