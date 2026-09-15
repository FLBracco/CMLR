import "reflect-metadata"; // Habilita metadata para decoradores
import { DataSource } from "typeorm"; // Clase principal de TypeORM
import { Environment } from "../env/environment.js"; // Configuración centralizada
import { ProfessionalSpeciality } from "../../modules/professionals/entities/professional-speciality.entity.js";
import { Professional } from "../../modules/professionals/entities/professional.entity.js";
import { Patient } from "../../modules/patients/entities/patient.entity.js";
import { Consultation } from "../../modules/consultations/entities/consultation.entity.js";
import { Admin } from "../../modules/admin/entities/admin.entity.js";
import { Appointment } from "../../modules/appointments/entities/appointment.entity.js";
import { SubscriptionSettings } from "../../modules/subscription-settings/entities/subscription-settings.entity.js";
import { EnableExtensions1786057121000 } from "../../migrations/1786057121000-EnableExtensions.js";
import { InitialSchema1786057121606 } from "../../migrations/1786057121606-InitialSchema.js";
import { AddSubscriptionsAndAdmins1788274429176 } from "../../migrations/1788274429176-AddSubscriptionsAndAdmins.js";
import { AddAppointments1788789521596 } from "../../migrations/1788789521596-AddAppointments.js";
import { AddProfessionalLicenseNumber1789398381249 } from "../../migrations/1789398381249-AddProfessionalLicenseNumber.js";
import { AddSubscriptionSettings1789400611858 } from "../../migrations/1789400611858-AddSubscriptionSettings.js";
import { AddPaymentReportedSubscriptionStatus1789474924384 } from "../../migrations/1789474924384-AddPaymentReportedSubscriptionStatus.js";

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

  // Mostrar SQL en desarrollo; en producción solo errores (ruido en logs del hosting)
  logging: Environment.app.isProduction ? ["error"] : true,

  // Entidades registradas explícitamente
  entities: [
    ProfessionalSpeciality,
    Professional,
    Patient,
    Consultation,
    Admin,
    Appointment,
    SubscriptionSettings,
  ],

  // Migraciones registradas explícitamente (EnableExtensions corre primero: las
  // entities dependen de uuid_generate_v4() como default de columna)
  migrations: [
    EnableExtensions1786057121000,
    InitialSchema1786057121606,
    AddSubscriptionsAndAdmins1788274429176,
    AddAppointments1788789521596,
    AddProfessionalLicenseNumber1789398381249,
    AddSubscriptionSettings1789400611858,
    AddPaymentReportedSubscriptionStatus1789474924384,
  ],

  // false en Docker local; Neon (y la mayoría de los proveedores managed) exige TLS
  ssl: Environment.database.ssl ? { rejectUnauthorized: false } : false,

  // El proveedor de hosting puede dormir el proceso mientras la DB hace scale-to-zero
  // por su cuenta con un timeout más corto: sin esto, TypeORM reintenta una conexión
  // que el otro lado ya cerró y la primera query después de una pausa larga falla.
  extra: { max: 5, idleTimeoutMillis: 120000 },
});
