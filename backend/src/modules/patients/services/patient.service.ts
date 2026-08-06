import { AppError } from "../../../shared/errors/AppError.js";
import type { Patient } from "../entities/patient.entity.js";
import { PatientRepository } from "../repositories/patient.repository.js";
import type { CreatePatientDto } from "../dto/create-patient.dto.js";
import type { UpdatePatientDto } from "../dto/update-patient.dto.js";
import type {
  IPatientDto,
  IPatientListDto,
} from "../dto/patient-response.dto.js";

export class PatientService {
  constructor(private readonly patientRepository = new PatientRepository()) {}

  async create(
    professionalId: string,
    dto: CreatePatientDto
  ): Promise<IPatientDto> {
    await this.assertDniNotDuplicated(dto.dni, professionalId);

    const patient = await this.patientRepository.create({
      professionalId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      dni: dto.dni,
      birthDate: dto.birthDate,
      phone: dto.phone,
      email: dto.email ?? null,
    });

    return this.toDto(patient);
  }

  async list(
    professionalId: string,
    search?: string
  ): Promise<IPatientListDto> {
    const patients = await this.patientRepository.search(professionalId, {
      ...(search !== undefined && { search }),
    });

    return {
      patients: patients.map((patient) => this.toDto(patient)),
    };
  }

  async getById(
    professionalId: string,
    id: string
  ): Promise<IPatientDto> {
    const patient = await this.getScopedPatient(professionalId, id);
    return this.toDto(patient);
  }

  async update(
    professionalId: string,
    id: string,
    dto: UpdatePatientDto
  ): Promise<IPatientDto> {
    const patient = await this.getScopedPatient(professionalId, id);

    if (dto.dni !== undefined && dto.dni !== patient.dni) {
      await this.assertDniNotDuplicated(dto.dni, professionalId, patient.id);
    }

    const updated = await this.patientRepository.update(patient, {
      ...(dto.firstName !== undefined && { firstName: dto.firstName }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName }),
      ...(dto.dni !== undefined && { dni: dto.dni }),
      ...(dto.birthDate !== undefined && { birthDate: dto.birthDate }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.email !== undefined && { email: dto.email }),
    });

    return this.toDto(updated);
  }

  private async assertDniNotDuplicated(
    dni: string,
    professionalId: string,
    excludePatientId?: string
  ): Promise<void> {
    const existing = await this.patientRepository.findByDni(dni, professionalId);

    if (existing && existing.id !== excludePatientId) {
      throw AppError.conflict("Ya existe un paciente con ese DNI.");
    }
  }

  private async getScopedPatient(
    professionalId: string,
    id: string
  ): Promise<Patient> {
    const patient = await this.patientRepository.findByIdScoped(
      id,
      professionalId
    );

    if (!patient) {
      throw AppError.notFound("Paciente no encontrado.");
    }

    return patient;
  }

  private toDto(patient: Patient): IPatientDto {
    const birthDate =
      patient.birthDate instanceof Date
        ? patient.birthDate.toISOString().slice(0, 10)
        : patient.birthDate;

    return {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dni: patient.dni,
      birthDate,
      phone: patient.phone,
      email: patient.email,
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
    };
  }
}
