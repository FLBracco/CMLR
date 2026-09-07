import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Patient } from "../../patients/entities/patient.entity.js";
import { Professional } from "../../professionals/entities/professional.entity.js";
import type { AppointmentStatus } from "./appointment-status.js";

@Entity("appointments")
@Index(["professionalId", "startsAt"])
export class Appointment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "uuid",
    name: "professional_id",
  })
  professionalId!: string;

  @Index()
  @Column({
    type: "uuid",
    name: "patient_id",
  })
  patientId!: string;

  @Column({
    type: "timestamptz",
    name: "starts_at",
  })
  startsAt!: Date;

  @Column({
    type: "timestamptz",
    name: "ends_at",
  })
  endsAt!: Date;

  @Column({
    type: "varchar",
    length: 20,
    default: "PENDING",
  })
  status!: AppointmentStatus;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
  })
  reason!: string | null;

  @Column({
    type: "text",
    nullable: true,
  })
  notes!: string | null;

  @Column({
    type: "text",
    name: "cancellation_reason",
    nullable: true,
  })
  cancellationReason!: string | null;

  @Column({
    type: "timestamptz",
    name: "status_updated_at",
    nullable: true,
  })
  statusUpdatedAt!: Date | null;

  @Column({
    type: "uuid",
    name: "created_by",
  })
  createdBy!: string;

  @Column({
    type: "uuid",
    name: "cancelled_by",
    nullable: true,
  })
  cancelledBy!: string | null;

  @CreateDateColumn({
    type: "timestamptz",
    name: "created_at",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: "timestamptz",
    name: "updated_at",
  })
  updatedAt!: Date;

  @ManyToOne(() => Professional, (professional) => professional.appointments, {
    nullable: false,
  })
  @JoinColumn({ name: "professional_id" })
  professional!: Professional;

  @ManyToOne(() => Patient, (patient) => patient.appointments, {
    nullable: false,
  })
  @JoinColumn({ name: "patient_id" })
  patient!: Patient;

  @ManyToOne(() => Professional, { nullable: false })
  @JoinColumn({ name: "created_by" })
  createdByProfessional!: Professional;

  @ManyToOne(() => Professional, { nullable: true })
  @JoinColumn({ name: "cancelled_by" })
  cancelledByProfessional!: Professional | null;
}
