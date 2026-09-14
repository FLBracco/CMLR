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

  // `from`/`to` son fechas calendario "YYYY-MM-DD" (ambas inclusivas), no
  // instantes: consultation_date es `date` en la DB, sin hora. `addSelect`
  // acotado en vez de `innerJoinAndSelect` para no traer DNI/teléfono/fecha
  // de nacimiento del paciente cuando solo hace falta el nombre.
  async findByProfessionalAndDateRange(
    professionalId: string,
    from: string,
    to: string
  ): Promise<Consultation[]> {
    return this.repository
      .createQueryBuilder("consultation")
      .innerJoin("consultation.patient", "patient")
      .addSelect(["patient.id", "patient.firstName", "patient.lastName"])
      .where("patient.professionalId = :professionalId", { professionalId })
      .andWhere("consultation.consultationDate BETWEEN :from AND :to", {
        from,
        to,
      })
      .orderBy("consultation.consultationDate", "ASC")
      .addOrderBy("consultation.createdAt", "ASC")
      .getMany();
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
