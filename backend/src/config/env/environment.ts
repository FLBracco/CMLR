import "dotenv/config";

export const Environment = {
  app: {
    port: Number(process.env.PORT) || 3000,
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  },

  database: {
    host: process.env.DATABASE_HOST ?? "localhost",
    port: Number(process.env.DATABASE_PORT) || 5432,
    username: process.env.DATABASE_USER ?? "",
    password: process.env.DATABASE_PASSWORD ?? "",
    database: process.env.DATABASE_NAME ?? "",
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? "",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "2h",
  },

  superAdmin: {
    email: process.env.SUPERADMIN_EMAIL ?? "",
    password: process.env.SUPERADMIN_PASSWORD ?? "",
  },
} as const;