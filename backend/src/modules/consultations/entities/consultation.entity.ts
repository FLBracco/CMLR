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

@Entity("consultations")
export class Consultation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({
    type: "uuid",
    name: "patient_id",
  })
  patientId!: string;

  @Index()
  @Column({
    type: "date",
    name: "consultation_date",
  })
  consultationDate!: Date;

  @Column({
    type: "text",
  })
  observations!: string;

  @Column({
    type: "text",
    nullable: true,
  })
  diagnosis!: string | null;

  @Column({
    type: "text",
    name: "follow_up_plan",
  })
  followUpPlan!: string;

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

  @ManyToOne(() => Patient, (patient) => patient.consultations, {
    nullable: false,
  })
  @JoinColumn({ name: "patient_id" })
  patient!: Patient;
}
