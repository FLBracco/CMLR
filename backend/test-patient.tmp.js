import { AppDataSource } from "./src/config/db/data-source.js";
import { PatientRepository } from "./src/modules/patients/repositories/patient.repository.js";
await AppDataSource.initialize();
const repo = new PatientRepository();
const p = await repo.findByIdScoped("b1e4b2a4-735e-47c2-9fad-5cca83d72b0d", "fe412fd9-b1ba-4958-b0b9-a12135d1f423");
console.log("birthDate type:", typeof p.birthDate, "value:", p.birthDate);
await AppDataSource.destroy();
//# sourceMappingURL=test-patient.tmp.js.map