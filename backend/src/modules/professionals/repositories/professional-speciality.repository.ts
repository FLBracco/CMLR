import { AppDataSource } from "../../../config/db/data-source.js";
import { ProfessionalSpeciality } from "../entities/professional-speciality.entity.js";

export class ProfessionalSpecialityRepository {
  private readonly repository =
    AppDataSource.getRepository(ProfessionalSpeciality);

  async findByCode(code: string): Promise<ProfessionalSpeciality | null> {
    return this.repository.findOne({ where: { code } });
  }

  async findAll(): Promise<ProfessionalSpeciality[]> {
    return this.repository.find({
      order: { name: "ASC" },
    });
  }
}
