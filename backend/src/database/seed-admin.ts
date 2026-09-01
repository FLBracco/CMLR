import bcrypt from "bcrypt";
import { AppDataSource } from "../config/db/data-source.js";
import { Environment } from "../config/env/environment.js";
import { Admin } from "../modules/admin/entities/admin.entity.js";

const SALT_ROUNDS = 10;

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const seedAdmin = async (): Promise<void> => {
  const email = normalizeEmail(Environment.superAdmin.email);
  const { password } = Environment.superAdmin;

  if (!email || !password) {
    throw new Error(
      "SUPERADMIN_EMAIL y SUPERADMIN_PASSWORD deben estar definidas en el .env para correr este seed."
    );
  }

  await AppDataSource.initialize();

  const repository = AppDataSource.getRepository(Admin);

  const exists = await repository.findOne({ where: { email } });

  if (exists) {
    console.log(`⏭️  Ya existe un admin con el email ${email}.`);
    await AppDataSource.destroy();
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await repository.save(repository.create({ email, passwordHash }));
  console.log(`✅ SuperAdmin creado: ${email}`);

  await AppDataSource.destroy();
};

seedAdmin().catch((error) => {
  console.error("❌ Error al ejecutar el seed de admin.");
  console.error(error);
  process.exit(1);
});
