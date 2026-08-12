import "reflect-metadata"; // Habilita metadata para decoradores
import { DataSource } from "typeorm"; // Clase principal de TypeORM
import { Environment } from "../env/environment.js"; // Configuración centralizada
import { ProfessionalSpeciality } from "../../modules/professionals/entities/professional-speciality.entity.js";
import { Professional } from "../../modules/professionals/entities/professional.entity.js";
import { Patient } from "../../modules/patients/entities/patient.entity.js";
import { Consultation } from "../../modules/consultations/entities/consultation.entity.js";
import { InitialSchema1786057121606 } from "../../migrations/1786057121606-InitialSchema.js";

export const AppDataSource = new DataSource({
  // Motor de base de datos
  type: "postgres",

  // Conexión
  host: Environment.database.host,
  port: Environment.database.port,
  username: Environment.database.username,
  password: Environment.database.password,
  database: Environment.database.database,

  // Seguridad: usamos migraciones, no sincronización automática
  synchronize: false,

  // Mostrar SQL en desarrollo
  logging: true,

  // Entidades registradas explícitamente
  entities: [ProfessionalSpeciality, Professional, Patient, Consultation],

  // Migraciones registradas explícitamente
  migrations: [InitialSchema1786057121606],

  // PostgreSQL local en Docker
  ssl: false,
});
