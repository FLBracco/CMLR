import { AppDataSource } from "../../../config/db/data-source.js";
import { Consultation } from "../entities/consultation.entity.js";
import type { DeepPartial } from "typeorm";

export class ConsultationRepository {
  private readonly repository = AppDataSource.getRepository(Consultation);

  async findByPatient(patientId: string): Promise<Consultation[]> {
    return this.repository.find({
      where: { patientId },
      order: { consultationDate: "ASC" },
    });
  }

  async findByIdWithPatient(id: string): Promise<Consultation | null> {
    return this.repository.findOne({
      where: { id },
      relations: { patient: true },
    });
  }

  async countByProfessionalSince(
    professionalId: string,
    since: Date
  ): Promise<number> {
    return this.repository
      .createQueryBuilder("consultation")
      .innerJoin("consultation.patient", "patient")
      .where("patient.professionalId = :professionalId", { professionalId })
      .andWhere("consultation.consultationDate >= :since", { since })
      .getCount();
  }

  async create(data: DeepPartial<Consultation>): Promise<Consultation> {
    const consultation = this.repository.create(data);
    return this.repository.save(consultation);
  }

  async update(
    consultation: Consultation,
    data: DeepPartial<Consultation>
  ): Promise<Consultation> {
    this.repository.merge(consultation, data);
    return this.repository.save(consultation);
  }
}
