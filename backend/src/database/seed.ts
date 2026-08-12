import { AppDataSource } from "../config/db/data-source.js";
import { ProfessionalSpeciality } from "../modules/professionals/entities/professional-speciality.entity.js";

const SPECIALITIES = [
  { code: "psychologist", name: "Psicólogo" },
  { code: "psychiatrist", name: "Psiquiatra" },
] as const;

const seedSpecialities = async (): Promise<void> => {
  await AppDataSource.initialize();

  const repository = AppDataSource.getRepository(ProfessionalSpeciality);

  for (const speciality of SPECIALITIES) {
    const exists = await repository.findOne({
      where: { code: speciality.code },
    });

    if (exists) {
      console.log(`⏭️  ${speciality.code} ya existe.`);
      continue;
    }

    await repository.save(repository.create(speciality));
    console.log(`✅ Especialidad creada: ${speciality.name}`);
  }

  await AppDataSource.destroy();
};

seedSpecialities().catch((error) => {
  console.error("❌ Error al ejecutar el seed.");
  console.error(error);
  process.exit(1);
});
