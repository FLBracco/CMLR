import { LessThanOrEqual } from "typeorm";
import { AppDataSource } from "../../../config/db/data-source.js";
import { Professional } from "../../professionals/entities/professional.entity.js";
import type { ProfessionalSpeciality } from "../../professionals/entities/professional-speciality.entity.js";
import type { SubscriptionStatus } from "../../professionals/entities/subscription-status.js";

export interface ICreateProfessionalData {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  speciality: ProfessionalSpeciality;
  licenseNumber: string;
}

export class ProfessionalRepository {
  private readonly repository = AppDataSource.getRepository(Professional);

  async findByEmail(email: string): Promise<Professional | null> {
    return this.repository.findOne({
      where: { email },
      relations: { speciality: true },
    });
  }

  async findByLicenseNumber(licenseNumber: string): Promise<Professional | null> {
    return this.repository.findOne({ where: { licenseNumber } });
  }

  async findById(id: string): Promise<Professional | null> {
    return this.repository.findOne({
      where: { id },
      relations: { speciality: true },
    });
  }

  async findAll(): Promise<Professional[]> {
    return this.repository.find({
      relations: { speciality: true },
      order: { createdAt: "DESC" },
    });
  }

  // Pre-filtro para el barrido de vencimiento: candidatos ACTIVE activados
  // hace más de `cutoff`. Los NULL quedan afuera solos (comparar con NULL en
  // SQL da NULL, no true) — es justo la política de "sin fecha, no vence".
  // La verdad final de si venció la decide isSubscriptionExpired, no esta query.
  async findActiveUpdatedBefore(cutoff: Date): Promise<Professional[]> {
    return this.repository.find({
      where: {
        subscriptionStatus: "ACTIVE",
        subscriptionUpdatedAt: LessThanOrEqual(cutoff),
      },
    });
  }

  async updateSubscriptionStatus(
    professional: Professional,
    status: SubscriptionStatus
  ): Promise<Professional> {
    professional.subscriptionStatus = status;
    professional.subscriptionUpdatedAt = new Date();
    return this.repository.save(professional);
  }

  async update(
    professional: Professional,
    data: Partial<
      Pick<Professional, "firstName" | "lastName" | "speciality" | "licenseNumber">
    >
  ): Promise<Professional> {
    this.repository.merge(professional, data);
    return this.repository.save(professional);
  }

  async create(data: ICreateProfessionalData): Promise<Professional> {
    const professional = this.repository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash: data.passwordHash,
      speciality: data.speciality,
      licenseNumber: data.licenseNumber,
      subscriptionStatus: "PENDING",
    });

    return this.repository.save(professional);
  }
}
