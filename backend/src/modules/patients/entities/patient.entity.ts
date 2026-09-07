import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Professional } from "../../professionals/entities/professional.entity.js";
import { Consultation } from "../../consultations/entities/consultation.entity.js";
import { Appointment } from "../../appointments/entities/appointment.entity.js";

@Entity("patients")
export class Patient {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({
    type: "uuid",
    name: "professional_id",
  })
  professionalId!: string;

  @Index()
  @Column({
    type: "varchar",
    length: 100,
    name: "first_name",
  })
  firstName!: string;

  @Index()
  @Column({
    type: "varchar",
    length: 100,
    name: "last_name",
  })
  lastName!: string;

  @Index()
  @Column({
    type: "varchar",
    length: 20,
  })
  dni!: string;

  @Column({
    type: "date",
    name: "birth_date",
  })
  birthDate!: Date;

  @Column({
    type: "varchar",
    length: 30,
  })
  phone!: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
  })
  email!: string | null;

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

  @ManyToOne(() => Professional, (professional) => professional.patients, {
    nullable: false,
  })
  @JoinColumn({ name: "professional_id" })
  professional!: Professional;

  @OneToMany(() => Consultation, (consultation) => consultation.patient)
  consultations!: Consultation[];

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments!: Appointment[];
}
