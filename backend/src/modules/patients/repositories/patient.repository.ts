import { AppDataSource } from "../../../config/db/data-source.js";
import { Patient } from "../entities/patient.entity.js";
import type { DeepPartial } from "typeorm";

export interface IPatientQuery {
  search?: string;
}

export class PatientRepository {
  private readonly repository = AppDataSource.getRepository(Patient);

  async findByDni(dni: string, professionalId: string): Promise<Patient | null> {
    return this.repository.findOne({
      where: { dni, professionalId },
    });
  }

  async findByIdScoped(
    id: string,
    professionalId: string
  ): Promise<Patient | null> {
    return this.repository.findOne({
      where: { id, professionalId },
    });
  }

  async search(
    professionalId: string,
    query: IPatientQuery
  ): Promise<Patient[]> {
    const qb = this.repository
      .createQueryBuilder("patient")
      .where("patient.professionalId = :professionalId", { professionalId })
      .orderBy("patient.createdAt", "DESC");

    if (query.search) {
      qb.andWhere(
        `(
          LOWER(patient.firstName) LIKE LOWER(:term) OR
          LOWER(patient.lastName) LIKE LOWER(:term) OR
          patient.dni LIKE :term
        )`,
        { term: `%${query.search}%` }
      );
    }

    return qb.getMany();
  }

  async create(data: DeepPartial<Patient>): Promise<Patient> {
    const patient = this.repository.create(data);
    return this.repository.save(patient);
  }

  async update(patient: Patient, data: DeepPartial<Patient>): Promise<Patient> {
    this.repository.merge(patient, data);
    return this.repository.save(patient);
  }
}
