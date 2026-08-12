import { AppError } from "../../../shared/errors/AppError.js";
import type { Consultation } from "../entities/consultation.entity.js";
import { ConsultationRepository } from "../repositories/consultation.repository.js";
import { PatientRepository } from "../../patients/repositories/patient.repository.js";
import type { CreateConsultationDto } from "../dto/create-consultation.dto.js";
import type { UpdateConsultationDto } from "../dto/update-consultation.dto.js";
import type {
  IConsultationDto,
  IConsultationListDto,
} from "../dto/consultation-response.dto.js";

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

  private toDto(consultation: Consultation): IConsultationDto {
    const consultationDate =
      consultation.consultationDate instanceof Date
        ? consultation.consultationDate.toISOString().slice(0, 10)
        : consultation.consultationDate;

    return {
      id: consultation.id,
      patientId: consultation.patientId,
      consultationDate,
      observations: consultation.observations,
      diagnosis: consultation.diagnosis,
      followUpPlan: consultation.followUpPlan,
      createdAt: consultation.createdAt.toISOString(),
      updatedAt: consultation.updatedAt.toISOString(),
    };
  }
}
