import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ProfessionalSpeciality } from "./professional-speciality.entity.js";
import { Patient } from "../../patients/entities/patient.entity.js";
import type { SubscriptionStatus } from "./subscription-status.js";

@Entity("professionals")
export class Professional {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "varchar",
    length: 100,
    name: "first_name",
  })
  firstName!: string;

  @Column({
    type: "varchar",
    length: 100,
    name: "last_name",
  })
  lastName!: string;

  @Column({
    type: "varchar",
    length: 255,
    unique: true,
  })
  email!: string;

  @Column({
    type: "text",
    name: "password_hash",
  })
  passwordHash!: string;

  @ManyToOne(
    () => ProfessionalSpeciality,
    (speciality) => speciality.professionals,
    { nullable: false }
  )
  @JoinColumn({ name: "specialty_id" })
  speciality!: ProfessionalSpeciality;

  @Column({
    type: "varchar",
    length: 20,
    name: "subscription_status",
    default: "PENDING",
  })
  subscriptionStatus!: SubscriptionStatus;

  @Column({
    type: "timestamptz",
    name: "subscription_updated_at",
    nullable: true,
  })
  subscriptionUpdatedAt!: Date | null;

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

  @OneToMany(() => Patient, (patient) => patient.professional)
  patients!: Patient[];
}
