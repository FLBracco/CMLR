import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Professional } from "./professional.entity.js";

@Entity("professional_specialities")
export class ProfessionalSpeciality {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "varchar",
    length: 55,
    unique: true,
  })
  code!: string;

  @Column({
    type: "varchar",
    length: 55,
    unique: true,
  })
  name!: string;

  @OneToMany(() => Professional, (professional) => professional.speciality)
  professionals!: Professional[];
}
