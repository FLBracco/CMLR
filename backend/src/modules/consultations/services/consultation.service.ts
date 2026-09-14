import { AppError } from "../../../shared/errors/AppError.js";
import type { Consultation } from "../entities/consultation.entity.js";
import { ConsultationRepository } from "../repositories/consultation.repository.js";
import { PatientRepository } from "../../patients/repositories/patient.repository.js";
import type { CreateConsultationDto } from "../dto/create-consultation.dto.js";
import type { UpdateConsultationDto } from "../dto/update-consultation.dto.js";
import type {
  IConsultationDto,
  IConsultationListDto,
  IConsultationStatsDto,
  IConsultationRangeListDto,
  IConsultationWithPatientDto,
} from "../dto/consultation-response.dto.js";

const MAX_RANGE_DAYS = 62;

export class ConsultationService {
  constructor(
    private readonly consultationRepository = new ConsultationRepository(),
    private readonly patientRepository = new PatientRepository()
  ) {}

  async create(
    professionalId: string,
    patientId: string,
    dto: CreateConsultationDto
  ): Promise<IConsultationDto> {
    await this.assertPatientOwnership(professionalId, patientId);

    const consultation = await this.consultationRepository.create({
      patientId,
      consultationDate: dto.consultationDate,
      observations: dto.observations,
      diagnosis: dto.diagnosis ?? null,
      followUpPlan: dto.followUpPlan,
    });

    return this.toDto(consultation);
  }

  async listByPatient(
    professionalId: string,
    patientId: string
  ): Promise<IConsultationListDto> {
    await this.assertPatientOwnership(professionalId, patientId);

    const consultations = await this.consultationRepository.findByPatient(
      patientId
    );

    return {
      consultations: consultations.map((consultation) =>
        this.toDto(consultation)
      ),
    };
  }

  async update(
    professionalId: string,
    id: string,
    dto: UpdateConsultationDto
  ): Promise<IConsultationDto> {
    const consultation = await this.getScopedConsultation(professionalId, id);

    const updated = await this.consultationRepository.update(consultation, {
      ...(dto.consultationDate !== undefined && {
        consultationDate: dto.consultationDate,
      }),
      ...(dto.observations !== undefined && {
        observations: dto.observations,
      }),
      ...(dto.diagnosis !== undefined && { diagnosis: dto.diagnosis }),
      ...(dto.followUpPlan !== undefined && {
        followUpPlan: dto.followUpPlan,
      }),
    });

    return this.toDto(updated);
  }

  // `from`/`to` son fechas calendario "YYYY-MM-DD" ya validadas en formato
  // por el controller (ver `parseDateOnlyParam`) — acá solo se valida el
  // orden y el largo del rango, igual que `AppointmentService.listByRange`.
  async listByDateRange(
    professionalId: string,
    from: string,
    to: string
  ): Promise<IConsultationRangeListDto> {
    this.assertValidRange(from, to);

    const consultations =
      await this.consultationRepository.findByProfessionalAndDateRange(
        professionalId,
        from,
        to
      );

    return {
      consultations: consultations.map((consultation) =>
        this.toDtoWithPatient(consultation)
      ),
    };
  }

  async getStats(professionalId: string): Promise<IConsultationStatsDto> {
    const now = new Date();
    const startOfWeek = this.getStartOfWeek(now);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [consultationsThisWeek, consultationsThisMonth] = await Promise.all([
      this.consultationRepository.countByProfessionalSince(professionalId, startOfWeek),
      this.consultationRepository.countByProfessionalSince(professionalId, startOfMonth),
    ]);

    return { consultationsThisWeek, consultationsThisMonth };
  }

  private getStartOfWeek(date: Date): Date {
    const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = result.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    result.setDate(result.getDate() + diffToMonday);
    return result;
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

  private async getScopedConsultation(
    professionalId: string,
    id: string
  ): Promise<Consultation> {
    const consultation = await this.consultationRepository.findByIdWithPatient(
      id
    );

    if (!consultation || consultation.patient.professionalId !== professionalId) {
      throw AppError.notFound("Consulta no encontrada.");
    }

    return consultation;
  }

  private assertValidRange(from: string, to: string): void {
    if (to < from) {
      throw AppError.badRequest(
        "El parámetro 'to' no puede ser anterior a 'from'."
      );
    }

    if (this.daysBetween(from, to) > MAX_RANGE_DAYS) {
      throw AppError.badRequest(
        `El rango de fechas no puede superar los ${MAX_RANGE_DAYS} días.`
      );
    }
  }

  // Comparación en UTC a partir de las partes YYYY-MM-DD (nunca `new
  // Date("YYYY-MM-DD")` directo, que JS interpreta como medianoche UTC y
  // puede desfasarse un día contra la zona local del server).
  private daysBetween(from: string, to: string): number {
    return (this.toUtcTimestamp(to) - this.toUtcTimestamp(from)) / (1000 * 60 * 60 * 24);
  }

  private toUtcTimestamp(dateOnly: string): number {
    const year = Number(dateOnly.slice(0, 4));
    const month = Number(dateOnly.slice(5, 7));
    const day = Number(dateOnly.slice(8, 10));

    return Date.UTC(year, month - 1, day);
  }

  private formatDateOnly(value: Date | string): string {
    return value instanceof Date ? value.toISOString().slice(0, 10) : value;
  }

  private toDto(consultation: Consultation): IConsultationDto {
    return {
      id: consultation.id,
      patientId: consultation.patientId,
      consultationDate: this.formatDateOnly(consultation.consultationDate),
      observations: consultation.observations,
      diagnosis: consultation.diagnosis,
      followUpPlan: consultation.followUpPlan,
      createdAt: consultation.createdAt.toISOString(),
      updatedAt: consultation.updatedAt.toISOString(),
    };
  }

  private toDtoWithPatient(
    consultation: Consultation
  ): IConsultationWithPatientDto {
    return {
      ...this.toDto(consultation),
      patient: {
        id: consultation.patient.id,
        firstName: consultation.patient.firstName,
        lastName: consultation.patient.lastName,
      },
    };
  }
}
