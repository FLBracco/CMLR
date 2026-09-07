import type { DeepPartial } from "typeorm";
import { AppDataSource } from "../../../config/db/data-source.js";
import { Appointment } from "../entities/appointment.entity.js";
import type { AppointmentStatus } from "../entities/appointment-status.js";

const ACTIVE_STATUSES: AppointmentStatus[] = ["PENDING", "CONFIRMED"];

export class AppointmentRepository {
  private readonly repository = AppDataSource.getRepository(Appointment);

  async findByIdScoped(
    id: string,
    professionalId: string
  ): Promise<Appointment | null> {
    return this.repository.findOne({
      where: { id, professionalId },
      relations: { patient: true },
    });
  }

  async findByRange(
    professionalId: string,
    from: Date,
    to: Date,
    status?: AppointmentStatus
  ): Promise<Appointment[]> {
    const qb = this.repository
      .createQueryBuilder("appointment")
      .innerJoinAndSelect("appointment.patient", "patient")
      .where("appointment.professionalId = :professionalId", { professionalId })
      .andWhere("appointment.startsAt < :to", { to })
      .andWhere("appointment.endsAt > :from", { from })
      .orderBy("appointment.startsAt", "ASC");

    if (status) {
      qb.andWhere("appointment.status = :status", { status });
    }

    return qb.getMany();
  }

  async findByPatient(
    patientId: string,
    professionalId: string,
    options: { upcomingOnly?: boolean } = {}
  ): Promise<Appointment[]> {
    const qb = this.repository
      .createQueryBuilder("appointment")
      .innerJoinAndSelect("appointment.patient", "patient")
      .where("appointment.patientId = :patientId", { patientId })
      .andWhere("appointment.professionalId = :professionalId", { professionalId });

    if (options.upcomingOnly) {
      return qb
        .andWhere("appointment.startsAt >= :now", { now: new Date() })
        .andWhere("appointment.status IN (:...statuses)", {
          statuses: ACTIVE_STATUSES,
        })
        .orderBy("appointment.startsAt", "ASC")
        .getMany();
    }

    return qb.orderBy("appointment.startsAt", "DESC").getMany();
  }

  async findOverlapping(
    professionalId: string,
    startsAt: Date,
    endsAt: Date,
    excludeId?: string
  ): Promise<Appointment | null> {
    const qb = this.repository
      .createQueryBuilder("appointment")
      .where("appointment.professionalId = :professionalId", { professionalId })
      .andWhere("appointment.status IN (:...statuses)", {
        statuses: ACTIVE_STATUSES,
      })
      .andWhere("appointment.startsAt < :endsAt", { endsAt })
      .andWhere("appointment.endsAt > :startsAt", { startsAt });

    if (excludeId) {
      qb.andWhere("appointment.id != :excludeId", { excludeId });
    }

    return qb.getOne();
  }

  async countInRange(
    professionalId: string,
    from: Date,
    to: Date
  ): Promise<number> {
    return this.repository
      .createQueryBuilder("appointment")
      .where("appointment.professionalId = :professionalId", { professionalId })
      .andWhere("appointment.startsAt >= :from", { from })
      .andWhere("appointment.startsAt < :to", { to })
      .getCount();
  }

  async countByStatus(
    professionalId: string,
    status: AppointmentStatus
  ): Promise<number> {
    return this.repository
      .createQueryBuilder("appointment")
      .where("appointment.professionalId = :professionalId", { professionalId })
      .andWhere("appointment.status = :status", { status })
      .getCount();
  }

  async create(data: DeepPartial<Appointment>): Promise<Appointment> {
    const appointment = this.repository.create(data);
    return this.repository.save(appointment);
  }

  async update(
    appointment: Appointment,
    data: DeepPartial<Appointment>
  ): Promise<Appointment> {
    this.repository.merge(appointment, data);
    return this.repository.save(appointment);
  }
}
