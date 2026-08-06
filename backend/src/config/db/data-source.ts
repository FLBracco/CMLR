import "reflect-metadata"; // Habilita metadata para decoradores
import { DataSource } from "typeorm"; // Clase principal de TypeORM
import { Environment } from "../env/environment.js"; // Configuración centralizada

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

  // Entidades registradas automáticamente
  entities: ["src/modules/**/*.entity.{ts,js}"],

  // Migraciones
  migrations: ["src/migrations/*.{ts,js}"],

  // PostgreSQL local en Docker
  ssl: false,
});