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
